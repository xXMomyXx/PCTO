using Microsoft.EntityFrameworkCore;
using FinaleAPI.Models;

namespace FinaleAPI.Data
{
    public class ApiDbContext : DbContext
    {
        public DbSet<Article> Articles { get; set; }
        public DbSet<Center> Centers { get; set; }
        public DbSet<ODP> ODPs { get; set; }

        public ApiDbContext()
        {
        }

        public ApiDbContext(DbSet<Article> articles, DbSet<Center> centers, DbSet<ODP> odps)
        {
            Articles = articles;
            Centers = centers;
            ODPs = odps;
        }

        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Article>(entity =>
            {
                entity.ToTable("articles");
                entity.HasKey(e => e.ID_Article);
            });
            modelBuilder.Entity<Center>(entity =>
            {
                entity.ToTable("centers");
                entity.HasNoKey();
            });
            modelBuilder.Entity<ODP>(entity =>
            {
                entity.ToTable("odps_v2");
                entity.HasKey(e => e.ID_ODP);
            });
        }
    }
}