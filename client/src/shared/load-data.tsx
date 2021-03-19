import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function useLoadedData<T>(uri: string) {
  const [errorLoading, setErrorLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const { getAccessTokenSilently } = useAuth0();
  const history = useHistory();
  const [totalItems, setTotalItems] = useState<number | undefined>(0);

  useEffect(() => {
    setIsLoading(true);
    setErrorLoading(false);

    const abortController = new AbortController();

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) return;

      if (!response.ok) {
        if (response.status === 401) history.push("/");
        else if (response.status === 404) history.push("/home");
        setErrorLoading(true);
      } else {
        const result = (await response.json()) as T;
        const totalCount = response.headers.get("x-total-count");
        if (totalCount) setTotalItems(parseInt(totalCount, 10));
        else setTotalItems(undefined);
        setData(result);
      }

      setIsLoading(false);
    }
    loadData();
    return () => abortController.abort();
  }, [getAccessTokenSilently, history, uri]);

  return {
    data,
    isLoading,
    errorLoading,
    totalItems,
  };
}

export default useLoadedData;
