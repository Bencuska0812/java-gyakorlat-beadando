package hu.travelhub.travelhub.controller;

import hu.travelhub.travelhub.entity.TravelOffer;
import hu.travelhub.travelhub.service.TravelOfferService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class TravelOfferController {

    private final TravelOfferService travelOfferService;

    public TravelOfferController(TravelOfferService travelOfferService) {
        this.travelOfferService = travelOfferService;
    }

    @GetMapping
    public List<TravelOffer> getAllOffers() {
        return travelOfferService.getAllOffers();
    }

    @GetMapping("/{id}")
    public TravelOffer getOfferById(@PathVariable Integer id) {
        return travelOfferService.getOfferById(id);
    }

    @PostMapping
    public TravelOffer createOffer(@RequestBody TravelOffer offer) {
        return travelOfferService.saveOffer(offer);
    }

    @PutMapping("/{id}")
    public TravelOffer updateOffer(@PathVariable Integer id, @RequestBody TravelOffer offer) {
        offer.setId(id);
        return travelOfferService.saveOffer(offer);
    }

    @DeleteMapping("/{id}")
    public void deleteOffer(@PathVariable Integer id) {
        travelOfferService.deleteOffer(id);
    }
}