using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject
{
    public class ProgramDefaultConfig
    {
        public List<string>? TypeNames { get; set; } = new();
        public List<string>? CriteriaTargets { get; set; } = new();
        public string? GraftedConditionApply {  get; set; } 
        public string? GraftedEvaluationApply {  get; set; }
        public List<string>? WorkTargets { get; set; } = new();
    }

}
