package hu.travelhub.travelhub.dto;

public class PriceStatistic {

    private String city;
    private Double averagePrice;

    public PriceStatistic(String city, Double averagePrice) {
        this.city = city;
        this.averagePrice = averagePrice;
    }

    public String getCity() {
        return city;
    }

    public Double getAveragePrice() {
        return averagePrice;
    }
}