using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinaleAPI.Data;
using FinaleAPI.Models;

namespace FinaleAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public ArticlesController(ApiDbContext context)
        {
            _context = context;
        }

        /* GET all customers - Inefficient method
         
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
        {
            return await _context.Articles.ToListAsync();
        } */

        //GET all customers - Paging method
        [HttpGet]
        public async Task<ActionResult<PagedResult<Article>>> GetArticlesPage(int page = 1, int pageSize = 1000)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 1000;

            var query = _context.Articles.OrderBy(a => a.ID_Article);
            var total = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResult<Article>
            {
                Items = items,
                TotalCount = total
            });
        }


        //Get first 1k customers

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> GetFirstThousandArticles()
        {
            return await _context.Articles.Take(1000).ToListAsync();
        }

        //GET one customer
        [HttpGet]
        public async Task<ActionResult<Article>> GetArticle(string id)
        {
            var article = await _context.Articles.FindAsync(id);
            return article == null ? NotFound() : article;
        }
    }
}