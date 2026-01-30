import axios from "axios";
import { toast } from "react-hot-toast";

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    toast.error(error.response?.data?.message || error.message);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Something went wrong");
  }

  console.error(error);
};
