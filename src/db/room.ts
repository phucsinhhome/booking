import { receptionApi } from "./apis";


export const listRoom = (numOfAdult: number, numOfChild: number, pageNumber: number, pageSize: number) => {
  console.info("List room");
  return receptionApi.get(
    `/room?numOfAdult=${numOfAdult}&numOfChild=${numOfChild}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
}