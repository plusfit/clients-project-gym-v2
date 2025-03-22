export interface UserInfo {
  name: string;
  password: string;
  identifier: string;
  dateBirthday: Date;
  sex: string;
  phone: string;
  address: string;
  historyofPathologicalLesions: boolean;
  medicalSociety: string;
  cardiacHistory: boolean;
  bloodPressure: string;
  frequencyOfPhysicalExercise: string;
  respiratoryHistory: boolean;
  surgicalHistory: boolean;
  CI: string;
  createdAt: string;
}

export interface User {
  _id: string;
  role: string;
  email: string;
  userInfo: UserInfo;
  planId: string;
  routineId: string;
}
