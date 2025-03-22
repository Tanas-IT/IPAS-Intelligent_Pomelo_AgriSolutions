using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System.ComponentModel;
using GenerativeAI.Types;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.SoftDeleteInterceptors
{
    public class SoftDeleteInterceptor : SaveChangesInterceptor
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SoftDeleteInterceptor(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var context = eventData.Context;
            if (context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

            var entries = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified && e.CurrentValues["IsDeleted"] != null)
                .ToList();

            var entitiesToSoftDelete = new List<object>();
            var entitiesToRestore = new List<object>();

            foreach (var entry in entries)
            {
                bool newDeleted = (bool)entry.CurrentValues["IsDeleted"];

                if (newDeleted) // Đánh dấu xóa mềm
                {
                    entitiesToSoftDelete.Add(entry.Entity);
                }
                else
                {
                    entitiesToRestore.Add(entry.Entity);
                }
            }

            if (entitiesToSoftDelete.Any())
            {
                await CascadeSoftDelete(entitiesToSoftDelete);
            }

            if (entitiesToRestore.Any())
            {
                await CascadeRestore(context, entitiesToRestore);
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private async Task CascadeSoftDelete(List<object> parents)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IpasContext>();

            var queue = new Queue<object>(parents); // Hàng đợi để duyệt các thực thể cha - con
            var visited = new HashSet<object>(); // Để tránh vòng lặp

            while (queue.Count > 0)
            {
                var parent = queue.Dequeue();
                if (visited.Contains(parent)) continue; // Bỏ qua nếu đã xử lý
                visited.Add(parent);

                var parentType = parent.GetType();
                var entityType = context.Model.FindEntityType(parentType);
                var primaryKeyProperty = entityType?.FindPrimaryKey()?.Properties.FirstOrDefault();
                if (primaryKeyProperty == null) continue;

                var parentId = parentType.GetProperty(primaryKeyProperty.Name)?.GetValue(parent);
                if (parentId == null) continue;

                var childNavigations = entityType.GetNavigations()
                    .Where(n => n.ForeignKey != null)
                    .Select(n => n.ForeignKey)
                    .ToList();

                foreach (var foreignKey in childNavigations)
                {
                    var childType = foreignKey.DeclaringEntityType.ClrType;
                    var foreignKeyProperty = foreignKey.Properties.First();

                    var dbSet = GetDbSet(context, childType) as IQueryable<object>;
                    if (dbSet == null) continue;

                    var children = await dbSet
                        .Where(child => EF.Property<object>(child, foreignKeyProperty.Name).Equals(parentId))
                        .ToListAsync();
                    using (var childScope = _scopeFactory.CreateScope()) // Tạo DbContext riêng cho children
                    {
                        var childContext = childScope.ServiceProvider.GetRequiredService<IpasContext>();
                        foreach (var child in children)
                        {
                            var isDeletedProperty = childType.GetProperty("IsDeleted");
                            if (isDeletedProperty != null)
                            {
                                isDeletedProperty.SetValue(child, true);
                                childContext.Entry(child).State = EntityState.Modified;
                            }
                        }
                    }
                        
                    queue.Enqueue(children.Cast<object>()); // Đẩy vào hàng đợi để xử lý tiếp
                }
            }

            await context.SaveChangesAsync(); // Chỉ lưu thay đổi một lần
        }



        // Hàm lấy DbSet<TEntity> động
        public static object GetDbSet(DbContext context, Type entityType)
        {
            var method = typeof(DbContext).GetMethod("Set", Type.EmptyTypes);
            if (method == null) throw new InvalidOperationException("Cannot find Set<TEntity>() method.");

            var genericMethod = method.MakeGenericMethod(entityType);
            return genericMethod.Invoke(context, null);
        }

        // Hàm tạo Expression để update field
        private object GetUpdateLambda(Type entityType, string propertyName, object value)
        {
            var parameter = Expression.Parameter(entityType, "e");
            var property = Expression.Property(parameter, propertyName);
            var constant = Expression.Constant(value);
            var assign = Expression.Assign(property, constant);
            return Expression.Lambda(assign, parameter);
        }


        private async Task CascadeRestore(DbContext context, List<object> parents)
        {
            var model = context.Model;
            var batchUpdates = new List<Task>();

            foreach (var parent in parents)
            {
                var parentType = parent.GetType();
                var entityType = model.FindEntityType(parentType);

                var childNavigations = entityType.GetNavigations()
                    .Where(n => !n.IsCollection)
                    .Select(n => n.ForeignKey)
                    .ToList();

                foreach (var foreignKey in childNavigations)
                {
                    var childType = foreignKey.DeclaringEntityType.ClrType;
                    var foreignKeyProperty = foreignKey.Properties.First();
                    var primaryKeyProperty = entityType.FindPrimaryKey()?.Properties.FirstOrDefault();
                    if (primaryKeyProperty == null) continue;

                    var parentId = parentType.GetProperty(primaryKeyProperty.Name)?.GetValue(parent);

                    if (parentId == null) continue;

                    var dbSet = GetDbSet(context, childType);
                    if (dbSet == null) continue;

                    var parameter = Expression.Parameter(childType, "e");
                    var propertyAccess = Expression.Property(parameter, foreignKeyProperty.Name);
                    var constant = Expression.Constant(parentId);
                    var equalsExpression = Expression.Equal(propertyAccess, constant);

                    var isDeletedProperty = Expression.Property(parameter, "IsDeleted");
                    var isDeletedTrue = Expression.Constant(true);
                    var isDeletedCondition = Expression.Equal(isDeletedProperty, isDeletedTrue);

                    var finalCondition = Expression.AndAlso(equalsExpression, isDeletedCondition);
                    var lambda = Expression.Lambda(finalCondition, parameter);

                    var whereMethod = typeof(Queryable).GetMethods()
                        .First(m => m.Name == "Where" && m.GetParameters().Length == 2)
                        .MakeGenericMethod(childType);

                    var filteredQuery = whereMethod.Invoke(null, new object[] { dbSet, lambda });

                    var executeUpdateMethod = filteredQuery!.GetType().GetMethod("ExecuteUpdateAsync");
                    var updateLambda = GetUpdateLambda(childType, "IsDeleted", false);
                    var updateTask = (Task)executeUpdateMethod!.Invoke(filteredQuery, new object[] { updateLambda, default(CancellationToken) });

                    batchUpdates.Add(updateTask);
                }
            }

            await Task.WhenAll(batchUpdates);
        }

    }
}
