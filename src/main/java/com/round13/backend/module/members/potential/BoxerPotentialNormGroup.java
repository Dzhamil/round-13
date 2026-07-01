package com.round13.backend.module.members.potential;

public enum BoxerPotentialNormGroup {
    MALE_16_PLUS("Парни"),
    FEMALE("Девушки"),
    CHILD("Дети");

    private final String label;

    BoxerPotentialNormGroup(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
