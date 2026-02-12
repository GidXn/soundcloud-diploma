using System.Collections.Generic;
using System.Threading.Tasks;
using soundcloud_back.Models.Category;

namespace soundcloud_back.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<int> CreateAsync(CategoryCreateModel model);
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
        Task UpdateAsync(int id, CategoryUpdateModel model);
        Task DeleteAsync(int id);
    }
}
