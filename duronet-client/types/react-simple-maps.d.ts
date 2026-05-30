declare module 'react-simple-maps' {
  import { ReactNode, ReactElement, FC } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export const ComposableMap: FC<ComposableMapProps>;

  export interface GeographyItem {
    rsmKey: string;
    properties: Record<string, any>;
    [key: string]: any;
  }

  export interface GeographiesRenderProps {
    geographies: GeographyItem[];
  }

  export interface GeographiesProps {
    geography: string;
    children?: (props: GeographiesRenderProps) => ReactNode;
  }

  export const Geographies: FC<GeographiesProps>;

  export interface GeographyProps {
    geography?: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, any>;
    onMouseEnter?: (geo: any) => void;
    onMouseLeave?: (geo: any) => void;
    onClick?: (geo: any) => void;
  }

  export const Geography: FC<GeographyProps>;

  export interface MarkerProps {
    coordinates?: [number, number];
    style?: Record<string, any>;
    onClick?: () => void;
    children?: ReactNode;
  }

  export const Marker: FC<MarkerProps>;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    onMoveEnd?: (event: any) => void;
    children?: ReactNode;
  }

  export const ZoomableGroup: FC<ZoomableGroupProps>;
}
