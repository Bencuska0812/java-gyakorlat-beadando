package hu.travelhub.travelhub.controller;

import hu.travelhub.travelhub.dto.CityStatistic;
import hu.travelhub.travelhub.dto.PriceStatistic;
import hu.travelhub.travelhub.dto.SummaryStatistic;
import hu.travelhub.travelhub.service.StatisticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/summary")
    public SummaryStatistic getSummary() {
        return statisticsService.getSummary();
    }

    @GetMapping("/offers-by-city")
    public List<CityStatistic> getOffersByCity() {
        return statisticsService.getOffersByCity();
    }

    @GetMapping("/hotels-by-city")
    public List<CityStatistic> getHotelsByCity() {
        return statisticsService.getHotelsByCity();
    }

    @GetMapping("/average-price-by-city")
    public List<PriceStatistic> getAveragePriceByCity() {
        return statisticsService.getAveragePriceByCity();
    }
}