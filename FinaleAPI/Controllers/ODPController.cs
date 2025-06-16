using FinaleAPI.Data;
using FinaleAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinaleAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ODPController : ControllerBase
    {
        private readonly ApiDbContext _context;
        public ODPController(ApiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<string>> GetODP(string odp_id)
        {
            var articleId = await _context.ODPs
                .Where(o => o.ID_ODP == odp_id)
                .Select(o => o.ID_Article)
                .FirstOrDefaultAsync();
            if (articleId == null)
                return NotFound();

            return articleId;
        }
    }
}
