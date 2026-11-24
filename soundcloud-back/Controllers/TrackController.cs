using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Models.Track;
using soundcloud_back.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Security.Claims;

namespace soundcloud_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;

        public TrackController(ITrackService trackService)
        {
            _trackService = trackService;
        }

        // ===== Public tracks =====
        [AllowAnonymous]
        [HttpGet("all")]
        [SwaggerOperation(OperationId = "GetAllTracksForAll", Summary = "Get all visible tracks")]
        public async Task<IActionResult> GetAllTracks()
        {
            var tracks = await _trackService.GetAllTracksAsync();
            return Ok(tracks);
        }

        // ===== Current user's tracks =====
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyTracks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }

            var userId = int.Parse(userIdClaim.Value);

            var tracks = await _trackService.GetAllByUserAsync(userId);
            return Ok(tracks);
        }

        // ===== Tracks of a specific user =====

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTracks(int userId)
        {
            var tracks = await _trackService.GetAllByUserAsync(userId);

            if (!tracks.Any())
                return NotFound($"No tracks found for user with id {userId}");

            return Ok(tracks);
        }


        // ===== Current user's tracks like=====
        [HttpGet]
        [SwaggerOperation(OperationId = "GetTracks", Summary = "Get all tracks of the current user")]
        public async Task<IActionResult> GetAll()
        {
            var tracks = await _trackService.GetAllAsync();
            return Ok(tracks);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(OperationId = "GetTrackById", Summary = "Get a track by ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();
            return Ok(track);
        }

        // ===== Creating a track =====
        [HttpPost]
        [SwaggerOperation(OperationId = "CreateTrack", Summary = "Create a new track")]
        public async Task<IActionResult> Create([FromBody] CreateTrackDto dto)
        {
            var created = await _trackService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPost("create-file")]
        [SwaggerOperation(OperationId = "CreateTrackFromFile", Summary = "Create a track from a local file")]
        public async Task<IActionResult> CreateTrackFile([FromForm] CreateTrackDto dto)
        {
            var track = await _trackService.CreateAsyncFile(dto);
            return Ok(track);
        }

        // ===== Updating a track =====
        [HttpPut("{id:int}")]
        [SwaggerOperation(OperationId = "UpdateTrack", Summary = "Update a track by ID")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateTrackDto dto)
        {
            await _trackService.UpdateAsyncFile(id, dto);
            return NoContent();
        }

        // ===== Deleting a track =====
        [HttpDelete("{id:int}")]
        [SwaggerOperation(OperationId = "DeleteTrack", Summary = "Delete a track by ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _trackService.DeleteAsync(id);
            return NoContent();
        }

        // ===== Hiding/restoring a track =====
        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/hide")]
        [SwaggerOperation(OperationId = "HideTrack", Summary = "Hide a track [Moderator, Admin]")]
        public async Task<IActionResult> Hide(int id)
        {
            await _trackService.HideAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/unhide")]
        [SwaggerOperation(OperationId = "UnhideTrack", Summary = "Restore track visibility [Moderator, Admin]")]
        public async Task<IActionResult> Unhide(int id)
        {
            await _trackService.UnhideAsync(id);
            return NoContent();
        }

        // ===== Cover upload =====
        [HttpPost("{id:int}/image")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(Summary = "Upload a track cover")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file, [FromServices] IImageStorage storage)
        {
            if (file == null || file.Length == 0) return BadRequest("No file");

            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();

            var url = await storage.SaveAsync(file, "tracks");
            await _trackService.SetImageAsync(id, url);

            return Ok(new { imageUrl = url });
        }


        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> Like(int id)
        {
            await _trackService.LikeAsync(id); // add a like
            var track = await _trackService.GetByIdAsync(id); // get the current track
            return Ok(track);
        }

        [HttpDelete("{id:int}/like")]
        public async Task<IActionResult> Unlike(int id)
        {
            await _trackService.UnlikeAsync(id); // remove the like
            var track = await _trackService.GetByIdAsync(id); // get the current track
            return Ok(track);
        }

        // Get the liked tracks of the authorized user
        // Liked tracks of any user: the «LIKES» block of another user's profile (Figma «profile PEOPLE»)
        [HttpGet("liked/{userId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikedTracksOfUser(int userId)
        {
            List<TrackDto> tracks = await _trackService.GetLikedByUserAsync(userId);
            return Ok(tracks);
        }

        [HttpGet("liked")]
        [Authorize]
        public async Task<IActionResult> GetLikedTracks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            List<TrackDto> tracks = await _trackService.GetLikedByUserAsync(userId);
            return Ok(tracks);
        }


        [HttpPost("{trackId}/play")]
        public async Task<IActionResult> PlayTrack(int trackId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value); // extracted from JWT
            await _trackService.AddPlayAsync(trackId);
            return Ok();
        }

        // ===== Statistics =====
        [HttpGet("{id:int}/stats")]
        [SwaggerOperation(OperationId = "GetTrackStats", Summary = "Get track statistics")]
        public async Task<IActionResult> GetTrackStats(int id)
        {
            var stats = await _trackService.GetTrackStatsAsync(id);
            return Ok(stats);
        }

        [HttpGet("author/{authorId:int}/stats")]
        [SwaggerOperation(OperationId = "GetAuthorStats", Summary = "Get author statistics")]
        public async Task<IActionResult> GetAuthorStats(int authorId)
        {
            var stats = await _trackService.GetAuthorStatsAsync(authorId);
            return Ok(stats);
        }
    }
}
