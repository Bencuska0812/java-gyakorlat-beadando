package hu.travelhub.travelhub.controller;

import hu.travelhub.travelhub.repository.CityRepository;
import hu.travelhub.travelhub.repository.HotelRepository;
import hu.travelhub.travelhub.repository.TravelOfferRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final CityRepository cityRepository;
    private final HotelRepository hotelRepository;
    private final TravelOfferRepository travelOfferRepository;

    public HomeController(
            CityRepository cityRepository,
            HotelRepository hotelRepository,
            TravelOfferRepository travelOfferRepository) {
        this.cityRepository = cityRepository;
        this.hotelRepository = hotelRepository;
        this.travelOfferRepository = travelOfferRepository;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("cities", cityRepository.findAll());
        model.addAttribute("hotels", hotelRepository.findAll());
        model.addAttribute("offers", travelOfferRepository.findAll());

        model.addAttribute("cityCount", cityRepository.count());
        model.addAttribute("hotelCount", hotelRepository.count());
        model.addAttribute("offerCount", travelOfferRepository.count());

        return "index";
    }
}