import React, { useEffect } from "react";
import EasyLoading from "react-native-easy-loading";

export const EasyLoadingProvider: React.FC<{
  children?: React.ReactNode;
}> = () => {
  useEffect(() => {
  
    try {
      if (EasyLoading && typeof EasyLoading.setDefaults === "function") {
        EasyLoading.setDefaults({
          displayDuration: 2000,
          animationDuration: 200,
        });
      }
    } catch (error) {
      console.warn("EasyLoading initialization warning:", error);
    }

    return () => {
      // Cleanup on unmount
      try {
        if (EasyLoading && typeof EasyLoading.dismiss === "function") {
          EasyLoading.dismiss();
        }
      } catch (error) {
        console.warn("EasyLoading cleanup warning:", error);
      }
    };
  }, []);

 
  return null;
};
