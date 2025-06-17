using Microsoft.EntityFrameworkCore;
using FinaleAPI.Models;

namespace FinaleAPI.Data
{
    public class ApiDbContext : DbContext
    {
        public DbSet<Article> Articles { get; set; }
        public DbSet<Center> Centers { get; set; }
        public DbSet<ODP> ODPs { get; set; }
        public DbSet<Material_idsecondary> Materials_idsecondary { get; set; }
        public DbSet<Material> Materials { get; set; }



        public ApiDbContext()
        {
        }

        public ApiDbContext(DbSet<Article> articles, DbSet<Center> centers, DbSet<ODP> odps, DbSet<Material_idsecondary> materials_idsecondary, DbSet<Material> materials)
        {
            Articles = articles;
            Centers = centers;
            ODPs = odps;
            Materials_idsecondary = materials_idsecondary;
            Materials = materials;
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
            modelBuilder.Entity<Material_idsecondary>(entity =>
            {
                entity.ToTable("material_idsecondarys");
                entity.HasNoKey();
            });
            modelBuilder.Entity<Material>(entity =>
            {
                entity.ToTable("materials");
                entity.HasKey(e => e.ID_Material);
            });
        }
    }
}
