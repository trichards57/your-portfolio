import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function useLoadedArrayData<T extends { id: string }>(
  uri: string,
  deleteUri?: string
) {
  const [errorLoading, setErrorLoading] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [showUndelete, setShowUndelete] = useState<string[]>([]);
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
        const result = (await response.json()) as T[];
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

  function removeUndelete(id: string) {
    setShowUndelete((d) => d.filter((i) => i !== id));
  }

  const deleteItem = useCallback(
    (id: string) => {
      setIsDeleting(true);
      setErrorDeleting(false);

      const abortController = new AbortController();

      async function runItem() {
        const delUri = `${deleteUri}?id=${id}`;

        const token = await getAccessTokenSilently({
          audience: "https://tr-toolbox.me.uk/your-portfolio",
        });

        const response = await fetch(delUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return;

        if (!response.ok) {
          if (response.status === 401) history.push("/");
          else if (response.status === 404) history.push("/home");
          setErrorDeleting(true);
        } else {
          setData((d) => d && d.filter((i) => i.id !== id));
          setTotalItems((s) => (s === undefined ? undefined : s - 1));
          setShowUndelete((i) => [...i, id]);
        }
        setIsDeleting(false);
      }

      runItem();
      return () => abortController.abort();
    },
    [getAccessTokenSilently, history, deleteUri]
  );

  return {
    data,
    isDeleting,
    isLoading,
    errorDeleting,
    errorLoading,
    showUndelete,
    totalItems,
    deleteItem,
    removeUndelete,
  };
}

export default useLoadedArrayData;
