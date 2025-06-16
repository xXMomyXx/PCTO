using FinaleAPI.Data;
using FinaleAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinaleAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class CentersController : ControllerBase
    {
        private readonly ApiDbContext _context;
        public CentersController(ApiDbContext context)
        {
            _context = context;
        }

        //GET all centers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<string>>> GetCenters()
        {
            var distinctCenterTypes = await _context.Centers
                .Where(c => c.ID_Type != "UND" && c.ID_Type.StartsWith("RO"))
                .Select(c => c.ID_Type)
                .Distinct()
                .OrderBy(id => id)
                .Skip(1) 
                .ToListAsync();

            return distinctCenterTypes;
        }
    }
}
