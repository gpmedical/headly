import { useEffect, useState } from "react";

import { getHeadacheHistoryEntries } from "@/lib/history";
import {
  type HeadacheHistoryEntry,
  type HeadacheHistoryQuery,
} from "@/types/history";

type HeadacheHistoryState = {
  query: HeadacheHistoryQuery | null;
  data: HeadacheHistoryEntry[];
  error: string | null;
  isLoading: boolean;
};

export function useHeadacheHistory(query: HeadacheHistoryQuery) {
  const [state, setState] = useState<HeadacheHistoryState>({
    query: null,
    data: [],
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    getHeadacheHistoryEntries(query)
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        setState({
          query,
          data: entries,
          error: null,
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setState({
          query,
          data: [],
          error: "Unable to load headache history.",
          isLoading: false,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return {
    data: state.data,
    error: state.query === query ? state.error : null,
    isLoading: state.query !== query || state.isLoading,
  };
}
