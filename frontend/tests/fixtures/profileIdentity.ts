export const completedProfileIdentityFixture = {
    surname: "Тестов",
    firstName: "Иван",
    patronymic: "Иванович",
} as const;

export const paddedProfileIdentityFixture = {
    surname: ` ${completedProfileIdentityFixture.surname} `,
    firstName: ` ${completedProfileIdentityFixture.firstName} `,
    patronymic: ` ${completedProfileIdentityFixture.patronymic} `,
};

export const profileContactFixture = { nickname: "boxer", phone: "+79991234567" } as const;
export const completedProfileFullNameFixture = "Тестов Иван Иванович";
