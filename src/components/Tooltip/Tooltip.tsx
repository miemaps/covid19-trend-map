import React,{
    useRef
} from 'react';
import {
    useWindowSize,
} from '@react-hook/window-size';
import { ThemeStyle, TrendColor } from '../../AppConfig';
import { numberFns } from'helper-toolkit-ts'

import {
    useSelector
} from 'react-redux';

import {
    tooltipDataSelector,
    tooltipPositionSelector
} from '../../store/reducers/Map'
import { COVID19TrendCategoryType } from 'covid19-trend-map';

export type TooltipPosition = {
    x: number;
    y: number;
};

export type TooltipData = {
    locationName: string;
    confirmed: number;
    deaths: number;
    weeklyNewCases: number;
    population: number;
    trendCategory?: COVID19TrendCategoryType;
}

type Props = {
    position: TooltipPosition;
    data: TooltipData
};

// const TooltipWidth = 200;
// const TooltipHeight = 150;
const PositionOffset = 10;

const Tooltip:React.FC<Props> = ({
    position,
    data
}) => {

    const containerRef = useRef<HTMLDivElement>()

    const [ width, height ] = useWindowSize();
    
    const getXPosition = ()=>{

        if(!position){
            return -99999;
        }

        const tooltipWidth = containerRef.current 
            ? containerRef.current.offsetWidth 
            : 200;

        if(position.x + tooltipWidth > width) {
            return position.x - tooltipWidth - PositionOffset;
        }

        return position.x + PositionOffset;
    };

    const getYPosition = ()=>{

        if(!position){
            return -99999;
        }

        const tooltipHeight = containerRef.current 
            ? containerRef.current.offsetHeight 
            : 150;
        

        if(position.y + tooltipHeight > height) {
            return position.y - tooltipHeight - PositionOffset;
        }

        return position.y + PositionOffset;
    };

    const getTrendType = ()=>{
        if(!data || !data.trendCategory){
            return null;
        }

        return (
            <div className='trailer-quarter'>
                <span>
                    <span className='text-theme-color-red avenir-demi font-size--1' style={{
                        'textTransform': 'uppercase',
                        'color': TrendColor[data.trendCategory].hex
                    }}>{ data.trendCategory}</span> trend
                </span>
            </div>
        )
    }

    return data ? (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                'top': getYPosition() + 'px',
                'left': getXPosition() + 'px',
                // 'height': TooltipHeight + 'px',
                // 'width': TooltipWidth + 'px',
                
                'background': ThemeStyle["theme-color-khaki-bright"],
                'pointerEvents': 'none',
                'boxSizing': 'border-box',
                'boxShadow': `0 0 10px 2px ${ThemeStyle["floating-panel-box-shadow"]}`,
                'zIndex': 5
            }}
        >
            <div
                style={{
                    'padding': '5px 15px',
                    'backgroundColor': '#E8E2D2',
                    'textTransform': 'uppercase'
                }}
            >
                <span className='text-theme-color-red avenir-demi font-size--1'>{ data.locationName }</span>
            </div>
            
            <div className='text-theme-color-khaki avenir-demi font-size--2'
                style={{
                    'padding': '5px 15px',
                }}
            >
                <span>
                    <span className='text-theme-color-red'>{numberFns.numberWithCommas(data.population)}</span> population
                </span>
                <br/>

                <span>
                    <span className='text-theme-color-red'>{numberFns.numberWithCommas(data.weeklyNewCases)}</span> new cases this week
                </span>
                <br/>

                <span>
                    <span className='text-theme-color-red'>{numberFns.numberWithCommas(data.confirmed)}</span> cumulative cases
                </span>
                <br/>

                <span>
                    <span className='text-theme-color-red'>{numberFns.numberWithCommas(data.deaths)}</span> deaths
                </span>

                {
                    getTrendType()
                }
            </div>
        </div>
    ) : null;
}

const TooltipConatiner = ()=>{

    const position = useSelector(tooltipPositionSelector);
    const data = useSelector(tooltipDataSelector);

    return (
        <Tooltip 
            position={position}
            data={data}
        />
    )
}

export default TooltipConatiner;
