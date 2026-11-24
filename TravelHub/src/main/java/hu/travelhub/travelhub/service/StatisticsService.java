package hu.travelhub.travelhub.service;

import hu.travelhub.travelhub.dto.CityStatistic;
import hu.travelhub.travelhub.dto.PriceStatistic;
import hu.travelhub.travelhub.dto.SummaryStatistic;
import hu.travelhub.travelhub.entity.City;
import hu.travelhub.travelhub.entity.Hotel;
import hu.travelhub.travelhub.entity.TravelOffer;
import hu.travelhub.travelhub.repository.CityRepository;
import hu.travelhub.travelhub.repository.HotelRepository;
import hu.travelhub.travelhub.repository.TravelOfferRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final CityRepository cityRepository;
    private final HotelRepository hotelRepository;
    private final TravelOfferRepository travelOfferRepository;

    public StatisticsService(
            CityRepository cityRepository,
            HotelRepository hotelRepository,
            TravelOfferRepository travelOfferRepository) {
        this.cityRepository = cityRepository;
        this.hotelRepository = hotelRepository;
        this.travelOfferRepository = travelOfferRepository;
    }

    public SummaryStatistic getSummary() {
        return new SummaryStatistic(
                cityRepository.count(),
                hotelRepository.count(),
                travelOfferRepository.count()
        );
    }

    public List<CityStatistic> getOffersByCity() {
        List<City> cities = cityRepository.findAll();
        List<Hotel> hotels = hotelRepository.findAll();
        List<TravelOffer> offers = travelOfferRepository.findAll();

        Map<String, Integer> hotelCityMap = hotels.stream()
                .collect(Collectors.toMap(
                        Hotel::getAz,
                        Hotel::getHelysegAz
                ));

        Map<Integer, Long> offerCountMap = offers.stream()
                .map(offer -> hotelCityMap.get(offer.getSzallodaAz()))
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        cityId -> cityId,
                        Collectors.counting()
                ));

        return cities.stream()
                .map(city -> new CityStatistic(
                        city.getNev(),
                        offerCountMap.getOrDefault(city.getAz(), 0L)
                ))
                .collect(Collectors.toList());
    }

    public List<CityStatistic> getHotelsByCity() {
        List<City> cities = cityRepository.findAll();
        List<Hotel> hotels = hotelRepository.findAll();

        Map<Integer, Long> hotelCountMap = hotels.stream()
                .collect(Collectors.groupingBy(
                        Hotel::getHelysegAz,
                        Collectors.counting()
                ));

        return cities.stream()
                .map(city -> new CityStatistic(
                        city.getNev(),
                        hotelCountMap.getOrDefault(city.getAz(), 0L)
                ))
                .collect(Collectors.toList());
    }

    public List<PriceStatistic> getAveragePriceByCity() {
        List<City> cities = cityRepository.findAll();
        List<Hotel> hotels = hotelRepository.findAll();
        List<TravelOffer> offers = travelOfferRepository.findAll();

        Map<String, Integer> hotelCityMap = hotels.stream()
                .collect(Collectors.toMap(
                        Hotel::getAz,
                        Hotel::getHelysegAz
                ));

        Map<Integer, List<Integer>> pricesByCity = new HashMap<>();

        for (TravelOffer offer : offers) {
            Integer cityId = hotelCityMap.get(offer.getSzallodaAz());

            if (cityId != null) {
                pricesByCity.computeIfAbsent(cityId, key -> new ArrayList<>())
                        .add(offer.getAr());
            }
        }

        return cities.stream()
                .map(city -> {
                    List<Integer> prices = pricesByCity.get(city.getAz());

                    Double averagePrice = prices == null || prices.isEmpty()
                            ? 0.0
                            : prices.stream()
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0.0);

                    return new PriceStatistic(city.getNev(), averagePrice);
                })
                .collect(Collectors.toList());
    }
}