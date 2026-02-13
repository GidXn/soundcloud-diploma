using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Data.Entities;
using soundcloud_back.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soundcloud_back.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/Admin/albums")]
    public class AdminAlbumController : ControllerBase
    {
        private readonly IAlbumService _albumService;

        public AdminAlbumController(IAlbumService albumService)
        {
            _albumService = albumService;
        }

        // GET: api/Admin/albums
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlbumEntity>>> GetAllAlbums()
        {
            var albums = await _albumService.GetAllAlbumsForAdminAsync();
            return Ok(albums);
        }
    }
}
