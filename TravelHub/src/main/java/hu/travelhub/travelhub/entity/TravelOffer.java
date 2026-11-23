package hu.travelhub.travelhub.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "tavasz")
public class TravelOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String szallodaAz;

    private LocalDate indulas;

    private Integer idotartam;

    private Integer ar;

    public TravelOffer() {
    }

    public TravelOffer(String szallodaAz, LocalDate indulas, Integer idotartam, Integer ar) {
        this.szallodaAz = szallodaAz;
        this.indulas = indulas;
        this.idotartam = idotartam;
        this.ar = ar;
    }

    public Integer getId() {
        return id;
    }

    public String getSzallodaAz() {
        return szallodaAz;
    }

    public void setSzallodaAz(String szallodaAz) {
        this.szallodaAz = szallodaAz;
    }

    public LocalDate getIndulas() {
        return indulas;
    }

    public void setIndulas(LocalDate indulas) {
        this.indulas = indulas;
    }

    public Integer getIdotartam() {
        return idotartam;
    }

    public void setIdotartam(Integer idotartam) {
        this.idotartam = idotartam;
    }

    public Integer getAr() {
        return ar;
    }

    public void setAr(Integer ar) {
        this.ar = ar;
    }
}