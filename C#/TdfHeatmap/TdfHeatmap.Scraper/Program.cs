using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using HtmlAgilityPack;
using Newtonsoft.Json;

namespace TdfHeatmap.Scraper
{
    class Program
    {
        private static GeocodeService geocoder;

        [STAThread]
        static void Main(string[] args)
        {
            geocoder = new GeocodeService();

            var tours = GetTdfTours("http://www.letour.fr/HISTO/fr/TDF/index.html");
            foreach (var tour in tours)
            {
                tour.Stages = GetTdfTourStages(tour.StagesUrl);
            }

            var towns = GetTownsFromTours(tours);
            SetLocationsForTowns(towns);

            var townsJson = JsonConvert.SerializeObject(towns);
            Console.WriteLine(townsJson);
            System.Windows.Clipboard.SetText(townsJson);

            Console.ReadLine();
        }

        private static void SetLocationsForTowns(IEnumerable<TdfTown> towns)
        {
            int count = 0;
            int townCount = towns.Count();

            foreach (var town in towns)
            {
                Console.WriteLine("Getting locations for town '{0}' ({1} of {2}).", town.Name, ++count, townCount);
                town.Location = geocoder.GetLocationForTown(town.Name);
            }
        }

        private static IEnumerable<TdfTour> GetTdfTours(string tourIndexUrl)
        {
            var pageLoader = new HtmlWeb();
            Console.WriteLine("Loading tour index page from {0}...", tourIndexUrl);
            var page = pageLoader.Load(tourIndexUrl);
            Console.WriteLine("Loaded tour index page.");

            var tours = new List<TdfTour>();

            Console.WriteLine("Reading tours from index page...");
            foreach (var tourLink in page.DocumentNode.SelectNodes("//div[@id='histoHome']/div[@class='section'][1]/a"))
            {
                tours.Add(new TdfTour
                {
                    Year = int.Parse(tourLink.InnerText),
                    StagesUrl = String.Format("http://www.letour.fr/HISTO/fr/TDF/{0}/etapes.html", tourLink.InnerText)
                });
            }
            Console.WriteLine("Read {0} tours from index page.", tours.Count());

            return tours;
        }

        private static IEnumerable<TdfTown> GetTownsFromTours(IEnumerable<TdfTour> tours)
        {
            Console.WriteLine("Extracting towns from tours...");
            var stages = tours.SelectMany(t => t.Stages.Select(s => new { Year = t.Year, Stage = s }));
            var townStages = stages.Select(s => new { Town = s.Stage.StartTown, Stage = s, WasStart = true })
                              .Concat(stages.Select(s => new { Town = s.Stage.FinishTown, Stage = s, WasStart = false }));

            var stagesByTown = townStages.GroupBy(ts => ts.Town);

            var towns = new List<TdfTown>();

            foreach (var town in stagesByTown)
            {
                towns.Add(new TdfTown
                {
                    Name = town.Key,
                    Stages = town.Select(s => new TdfTownStage
                    {
                        Year = s.Stage.Year,
                        Date = s.Stage.Stage.Date,
                        Ordinal = s.Stage.Stage.Ordinal,
                        WasStartTown = s.WasStart
                    })
                });
            }

            Console.WriteLine("Extracted towns from tours.", towns.Count());

            return towns;
        }

        private static IEnumerable<TdfTown> GetTdfTowns()
        {
            var pageLoader = new HtmlWeb();
            Console.WriteLine("Loading town listing...");
            var page = pageLoader.Load("http://www.letour.fr/HISTO/us/TDF/villes.html");
            Console.WriteLine("Loaded town listing.");

            Console.WriteLine("Reading towns...");

            foreach (var townLink in page.DocumentNode.SelectNodes("//li[@class='ville']/a"))
            {
                yield return new TdfTown
                {
                    Name = townLink.InnerText,
                    //Url = townLink.Attributes["href"].Value
                };
            }

            Console.WriteLine("Read towns.");
        }

        

        private static IEnumerable<TdfTourStage> GetTdfTourStages(string tourStagesUrl)
        {
            var pageLoader = new HtmlWeb();
            Console.WriteLine("Loading stage listing for tour from {0}...", tourStagesUrl);
            var page = pageLoader.Load(tourStagesUrl);
            Console.WriteLine("Loaded stage listing for tour.");

            Console.WriteLine("Reading stages for tour...");

            var stages = new List<TdfTourStage>();
            int ordinal = 0;
            foreach (var stageRow in page.DocumentNode.SelectNodes("//table[@class='liste']//tr").Skip(1))
            {
                var cells = stageRow.Elements("td").ToList();
                DateTime date;


                stages.Add(new TdfTourStage
                {
                    Name = cells[0].Element("a").InnerText,
                    Date = DateTime.TryParse(cells[1].InnerText, out date) ? date : (DateTime?)null,
                    Ordinal = ordinal++,
                    StartTown = cells[2].Element("a").InnerText,
                    FinishTown = cells[3].Element("a").InnerText
                });
            }

            Console.WriteLine("Read stages for tour.");

            return stages;
        }
    }

    public class TdfTown
    {
        public string Name {get; set;}
        public IEnumerable<TdfTownStage> Stages { get; set; }
        public Location Location { get; set; }
    }

    public class TdfTownStage
    {
        public int Year {get; set;}
        public int Ordinal {get; set;}
        public DateTime? Date {get; set;}
        public bool WasStartTown {get; set;}
    }

    public class TdfTourStage
    {
        public int Ordinal { get; set; }
        public string Name { get; set; }
        public DateTime? Date { get; set; }
        public string StartTown { get; set; }
        public string FinishTown { get; set; }
    }

    public class Location
    {
        public float Latitude {get; set;}
        public float Longitude {get; set;}
    }

    public class TdfTour
    {
        public int Year { get; set; }
        public string StagesUrl { get; set; }
        public IEnumerable<TdfTourStage> Stages { get; set; }
    }
}
