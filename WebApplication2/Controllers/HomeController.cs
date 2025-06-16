using System.Diagnostics;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using WebApplication2.Models;
using Newtonsoft.Json;

namespace WebApplication2.Controllers
{
    public class HomeController : Controller
    {
        private readonly HttpClient ClientHttp;
        public HomeController(HttpClient httpClient)
        {
            ClientHttp = httpClient;
        }
        public async Task<IActionResult> GetImage(string codArt, string ID_CenterType)
        {

            var apiUrl = $"http://ada-prod:55555/webapi/PlantMonitor/GetMaterialAttacchiRadiatoreImage?CodArt={codArt}&ID_CenterType={ID_CenterType}";

            try
            {
                var imageBytes = await ClientHttp.GetByteArrayAsync(apiUrl);
                return File(imageBytes, "image/jpeg");
            }
            catch
            {
                return StatusCode(500, "Unable to fetch image.");
            }
        }
        

        public async Task<IActionResult> Index()
        {
            return RedirectToAction("RicercaGenerale");
        }
        public async Task<IActionResult> RicercaGenerale()
        {
            var centerResponse = await ClientHttp.GetAsync("https://localhost:7087/api/Centers/GetCenters");

            if (!centerResponse.IsSuccessStatusCode)
            {
                return View("Error");
            }
            var centersJsonData = await centerResponse.Content.ReadAsStringAsync();
            var centers = JsonConvert.DeserializeObject<List<string>>(centersJsonData);

            var viewModel = new HomePageViewModel
            {
                Centers = centers
            };

            return View(viewModel);
        }

        public async Task<IActionResult> RicercaSpecifica()
        {
            var centerResponse = await ClientHttp.GetAsync("https://localhost:7087/api/Centers/GetCenters");

            if (!centerResponse.IsSuccessStatusCode)
            {
                return View("Error");
            }

            var centersJsonData = await centerResponse.Content.ReadAsStringAsync();
            var centers = JsonConvert.DeserializeObject<List<string>>(centersJsonData);

            var viewModel = new HomePageViewModel
            {
                Centers = centers
            };

            return View(viewModel); 
        }

        public async Task<IActionResult> RicercaODP()
        {
            var centerResponse = await ClientHttp.GetAsync("https://localhost:7087/api/Centers/GetCenters");

            if (!centerResponse.IsSuccessStatusCode)
            {
                return View("Error");
            }

            var centersJsonData = await centerResponse.Content.ReadAsStringAsync();
            var centers = JsonConvert.DeserializeObject<List<string>>(centersJsonData);

            var viewModel = new HomePageViewModel
            {
                Centers = centers
            };

            return View(viewModel);
        }

        public async Task<IActionResult> RicercaCravatta()
        {
            var centerResponse = await ClientHttp.GetAsync("https://localhost:7087/api/Centers/GetCenters");

            if (!centerResponse.IsSuccessStatusCode)
            {
                return View("Error");
            }

            var centersJsonData = await centerResponse.Content.ReadAsStringAsync();
            var centers = JsonConvert.DeserializeObject<List<string>>(centersJsonData);

            var viewModel = new HomePageViewModel
            {
                Centers = centers
            };

            return View(viewModel);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
