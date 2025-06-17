using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinaleAPI.Data;
using FinaleAPI.Models;

namespace FinaleAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MaterialSecondaryController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public MaterialSecondaryController(ApiDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Given a secondary‐ID, returns the final Article ID by joining:
        /// material_idsecondarys → materials → odps_v2.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<string>> GetArticleBySecondary(string secondaryId)
        {
            // 1) lookup ID_Material from material_idsecondarys
            var materialId = await _context.Materials_idsecondary
                .Where(m => m.IDSecondary == secondaryId)
                .Select(m => m.ID_Material)
                .FirstOrDefaultAsync();

            if (materialId == null)
                return NotFound($"No Material found for secondary ID '{secondaryId}'.");

            // 2) lookup ID_ODP from materials table
            var odpId = await _context.Materials  // assuming you added DbSet<Material> Materials
                .Where(m => m.ID_Material == materialId)
                .Select(m => m.ID_ODP)
                .FirstOrDefaultAsync();

            if (odpId == null)
                return NotFound($"No ODP found for material ID '{materialId}'.");

            // 3) lookup ID_Article from odps_v2
            var articleId = await _context.ODPs
                .Where(o => o.ID_ODP == odpId)
                .Select(o => o.ID_Article)
                .FirstOrDefaultAsync();

            if (articleId == null)
                return NotFound($"No Article found for ODP ID '{odpId}'.");

            return articleId;
        }
    }
}
