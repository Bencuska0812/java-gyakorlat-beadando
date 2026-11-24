package hu.travelhub.travelhub.dto;

public class SummaryStatistic {

    private Long cities;
    private Long hotels;
    private Long offers;

    public SummaryStatistic(Long cities, Long hotels, Long offers) {
        this.cities = cities;
        this.hotels = hotels;
        this.offers = offers;
    }

    public Long getCities() {
        return cities;
    }

    public Long getHotels() {
        return hotels;
    }

    public Long getOffers() {
        return offers;
    }
}