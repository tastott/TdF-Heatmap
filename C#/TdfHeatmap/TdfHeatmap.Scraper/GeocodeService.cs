using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace TdfHeatmap.Scraper
{
    public class GeocodeService
    {
        private static readonly int RequestInterval = 150;

        public Location GetLocationForTown(string townName)
        {
            Thread.Sleep(RequestInterval);
            var requestUri = string.Format("http://maps.googleapis.com/maps/api/geocode/xml?address={0}&sensor=false", Uri.EscapeDataString(townName));

            var request = WebRequest.Create(requestUri);
            var response = request.GetResponse();
            var xdoc = XDocument.Load(response.GetResponseStream());

            Location location = null;

            try
            {
                var result = xdoc.Element("GeocodeResponse").Element("result");
                var locationElement = result.Element("geometry").Element("location");
                var lat = float.Parse(locationElement.Element("lat").Value);
                var lng = float.Parse(locationElement.Element("lng").Value);

                location = new Location
                {
                    Latitude = lat,
                    Longitude = lng
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to find location for town. XML: {0}", xdoc.Root.ToString());
            }

            return location;
        }
    }
}
