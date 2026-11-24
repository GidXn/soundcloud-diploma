using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using soundcloud_back.Models.Album;
using soundcloud_back.Services.Interfaces;
using soundcloud_back.Models.Track;
using System.Security.Claims;

namespace soundcloud_back.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AlbumController : ControllerBase
    {
        private readonly IAlbumService _albumService;

        public AlbumController(IAlbumService albumService)
        {
            _albumService = albumService;
        }

        // ===== Get all albums of a user by ID  =====


        [HttpGet("user/{userId:int}")]
        [SwaggerOperation(OperationId = "GetAlbumsByUser", Summary = "Get all albums of a user by ID")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var albums = await _albumService.GetAllByUserAsync(userId);
            // An empty list is not an error
            return Ok(albums);
        }

        // ===== CRUD for the current user =====

        [HttpGet]
        [SwaggerOperation(OperationId = "GetAlbums", Summary = "Get all albums of the user")]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }

            var userId = int.Parse(userIdClaim.Value);
            var albums = await _albumService.GetAllByUserAsync(userId); // the new method takes into account IsPublic
            return Ok(albums);
        }
        [HttpGet("public")]
        [SwaggerOperation(OperationId = "GetAllAlbums", Summary = "Get all public albums of users")]
        public async Task<IActionResult> GetAllPublicAlbums()
        {
            var albums = await _albumService.GetAllPublicAlbumsAsync(); 
            return Ok(albums);
        }


        [HttpGet("{id:int}")]
        [SwaggerOperation(OperationId = "GetAlbumById", Summary = "Get an album by ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var album = await _albumService.GetByIdAsync(id);
            if (album == null) return NotFound();
            if (!album.IsPublic && album.OwnerId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Forbid();
            return Ok(album);
        }

        [HttpPost]
        [SwaggerOperation(OperationId = "CreateAlbum", Summary = "Create a new album")]
        public async Task<IActionResult> Create([FromForm] CreateAlbumDto dto)
        {
            var created = await _albumService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(OperationId = "UpdateAlbum", Summary = "Update an album by ID")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAlbumDto dto)
        {
            await _albumService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(OperationId = "DeleteAlbum", Summary = "Delete an album by ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _albumService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id:int}/cover")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(Summary = "Upload an album cover")]
        public async Task<IActionResult> UploadCover(int id, IFormFile file, [FromServices] IImageStorage storage)
        {
            if (file is null || file.Length == 0) return BadRequest("No file");

            var url = await storage.SaveAsync(file, "albums");
            await _albumService.SetCoverAsync(id, url);

            return Ok(new { coverUrl = url });
        }

        // ===== Admin: all albums =====
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        [SwaggerOperation(OperationId = "GetAllAlbumsForAdmin", Summary = "Get all albums for the admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var albums = await _albumService.GetAllAlbumsForAdminAsync();
            return Ok(albums);
        }

        // ===== New methods for tracks =====

        // Get all tracks of an album
        [HttpGet("{albumId:int}/tracks")]
        [SwaggerOperation(OperationId = "GetTracksByAlbum", Summary = "Get all tracks of an album")]
        public async Task<IActionResult> GetTracks(int albumId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (!album.IsPublic && album.OwnerId != userId)
                return Forbid();

            var tracks = await _albumService.GetTracksByAlbumAsync(albumId);
            return Ok(tracks);
        }

        // Add a track to an album
        [HttpPost("{albumId:int}/tracks/{trackId:int}")]
        [SwaggerOperation(OperationId = "AddTrackToAlbum", Summary = "Add a track to an album")]
        public async Task<IActionResult> AddTrack(int albumId, int trackId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (album.OwnerId != userId && !User.IsInRole("Admin"))
                return Forbid();

            await _albumService.AddTrackToAlbumAsync(albumId, trackId);
            return NoContent();
        }

        // Remove a track from an album
        [HttpDelete("{albumId:int}/tracks/{trackId:int}")]
        [SwaggerOperation(OperationId = "RemoveTrackFromAlbum", Summary = "Remove a track from an album")]
        public async Task<IActionResult> RemoveTrack(int albumId, int trackId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (album.OwnerId != userId && !User.IsInRole("Admin"))
                return Forbid();

            await _albumService.RemoveTrackFromAlbumAsync(albumId, trackId);
            return NoContent();
        }
    }
}
