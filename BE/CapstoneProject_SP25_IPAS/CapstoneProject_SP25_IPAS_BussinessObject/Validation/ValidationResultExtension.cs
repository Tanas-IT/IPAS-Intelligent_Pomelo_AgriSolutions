using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Validation
{
    public static class ValidationResultExtension
    {
        // Config ValidationResult to ValidationProblemDetails instance
        public static ValidationProblemDetails ToProblemDetails(this ValidationResult result)
        {
            // Init validation problem details
            ValidationProblemDetails validationProblemDetails = new()
            {
                Status = StatusCodes.Status400BadRequest
            };

            // Each ValidationResult.Errors is ValidationFailure
            // Contains pair <key,value> (Property, ErrorMessage)
            foreach (FluentValidation.Results.ValidationFailure failure in result.Errors)
            {
                // If failure already exist
                if (validationProblemDetails.Errors.ContainsKey(failure.PropertyName))
                {
                    // Concat old error with new error
                    validationProblemDetails.Errors[failure.PropertyName] =
                        // Current arr of error
                        validationProblemDetails.Errors[failure.PropertyName]
                        // Concat with new error
                        .Concat(new[] { failure.ErrorMessage }).ToArray();

                }
                else
                { // failure is not exist yet
                    // Add errors
                    validationProblemDetails.Errors.Add(new KeyValuePair<string, string[]>(
                        failure.PropertyName,
                        new[] { failure.ErrorMessage }));
                }
            }

            return validationProblemDetails;
        }


        // // Config ValidationResult.Errors to ValidationProblemDetails instance
        public static ValidationProblemDetails ToProblemDetails(this IEnumerable<FluentValidation.Results.ValidationFailure> errors)
        {
            // Init validation problem details
            ValidationProblemDetails validationProblemDetails = new()
            {
                Status = StatusCodes.Status400BadRequest
            };

            // Each ValidationResult.Errors is ValidationFailure
            // Contains pair <key,value> (Property, ErrorMessage)
            foreach (FluentValidation.Results.ValidationFailure failure in errors)
            {
                // If failure already exist
                if (validationProblemDetails.Errors.ContainsKey(failure.PropertyName))
                {
                    // Concat old error with new error
                    validationProblemDetails.Errors[failure.PropertyName] =
                        // Current arr of error
                        validationProblemDetails.Errors[failure.PropertyName]
                        // Concat with new error
                        .Concat(new[] { failure.ErrorMessage }).ToArray();

                }
                else
                { // failure is not exist yet
                    // Add errors
                    validationProblemDetails.Errors.Add(new KeyValuePair<string, string[]>(
                        failure.PropertyName,
                        new[] { failure.ErrorMessage }));
                }
            }

            return validationProblemDetails;
        }
    }
}
