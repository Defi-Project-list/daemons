import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';

export * from './store';
export * as actionCreators from "./action-creators/script-action-creators";
export * from './reducers';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<any>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
