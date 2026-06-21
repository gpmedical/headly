import { useEffect, useState } from "react";

import { getHeadacheHistoryEntries } from "@/lib/history";
import {
  type HeadacheHistoryEntry,
  type HeadacheHistoryQuery,
} from "@/types/history";

type HeadacheHistoryState = {
  data: HeadacheHistoryEntry[];
  error: string | null;
  isLoading: boolean;
};

export function useHeadacheHistory(query: HeadacheHistoryQuery) {
  const [state, setState] = useState<HeadacheHistoryState>({
    data: [],
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }));

    getHeadacheHistoryEntries(query)
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        setState({
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
          data: [],
          error: "Unable to load headache history.",
          isLoading: false,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return state;
}
