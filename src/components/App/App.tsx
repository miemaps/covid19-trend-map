import React, {
    useEffect,
    useState
} from 'react';

import axios from 'axios';

import MapView from '../MapView/MapView';
import Covid19TrendLayer from '../Covid19TrendLayer/Covid19TrendLayer';
import QueryTaskLayer from '../QueryTaskLayer/QueryTaskLayer';
import ControlPanel from '../ControlPanel/ControlPanel';
import ChartPanel from '../ChartPanel/ChartPanel';
import BottomPanel from '../BottomPanel/BottomPanel';
import SummaryInfoPanel from '../SummaryInfoPanel/SummaryInfoPanel';

import {
    Covid19TrendName,
    Covid19USCountyTrendData,
    Covid19USStateTrendData,
    Covid19CasesByTimeFeature
} from 'covid19-trend-map'

import AppConfig from '../../AppConfig';

import {
    urlFns
} from 'helper-toolkit-ts';

import {
    fetchCovid19Data
} from '../../utils/queryCovid19Data';

const UrlSearchParams = urlFns.parseQuery();
// console.log(UrlSearchParams.trend)

const DefaultTrend:Covid19TrendName = UrlSearchParams.trend;

const App = () => {

    const [ activeTrend, setActiveTrend ] = useState<Covid19TrendName>(DefaultTrend || 'new-cases');

    const [ covid19USCountiesData, setCovid19USCountiesData ] = useState<Covid19USCountyTrendData[]>();

    const [ covid19USStatesData, setCovid19USStatesData ] = useState<Covid19USStateTrendData[]>();

    const [ covid19CasesByTimeQueryResults, setCovid19CasesByTimeQueryResults ] = useState<Covid19CasesByTimeFeature[]>();

    const [ covid19CasesByTimeQueryLocationName, setcovid19CasesByTimeQueryLocationName ] = useState<string>();

    const fetchData = async()=>{

        try {
            const queryResUSCounties = await axios.get<Covid19USCountyTrendData[]>(AppConfig["covid19-data-us-counties-url"]);
            setCovid19USCountiesData(queryResUSCounties.data);
            // console.log(queryResUSCounties)

            const queryResUSStates = await axios.get<Covid19USStateTrendData[]>(AppConfig["covid19-data-us-states-url"]);
            setCovid19USStatesData(queryResUSStates.data);
            // console.log(queryResUSStates)

        } catch(err){
            console.error(err);
        }

    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <MapView 
                webmapId={AppConfig["webmap-id"]}
            >
                <Covid19TrendLayer 
                    key='US-Counties'
                    features={covid19USCountiesData}
                    activeTrend={activeTrend}
                    size={18}
                    visibleScale={AppConfig["us-counties-layer-visible-scale"]}
                />

                <Covid19TrendLayer 
                    key='US-States'
                    features={covid19USStatesData}
                    activeTrend={activeTrend}
                    size={24}
                    visibleScale={AppConfig["us-states-layer-visible-scale"]}
                />

                <QueryTaskLayer 
                    key='query-4-US-Counties'
                    itemId='7566e0221e5646f99ea249a197116605'
                    outFields={['FIPS']}
                    visibleScale={AppConfig["us-counties-layer-visible-scale"]}
                    onSelect={async(countyFeature)=>{
                        const countyName = `${countyFeature.attributes['NAME']} CO, ${countyFeature.attributes['STATE_NAME']}`
                        setcovid19CasesByTimeQueryLocationName(countyName);

                        const data = await fetchCovid19Data({
                            countyFIPS: countyFeature.attributes['FIPS']
                        });
                        setCovid19CasesByTimeQueryResults(data);
                    }}
                />

                <QueryTaskLayer 
                    key='query-4-US-States'
                    itemId='99fd67933e754a1181cc755146be21ca'
                    outFields={['STATE_NAME']}
                    visibleScale={AppConfig["us-states-layer-visible-scale"]}
                    onSelect={async(stateFeature)=>{

                        const stateName = stateFeature.attributes['STATE_NAME'];
                        setcovid19CasesByTimeQueryLocationName(stateName);

                        const data = await fetchCovid19Data({
                            stateName
                        });
                        setCovid19CasesByTimeQueryResults(data);
                    }}
                />
            </MapView>

            <ControlPanel 
                activeTrend={activeTrend}
                activeTrendOnChange={setActiveTrend}
            />

            {
                covid19CasesByTimeQueryResults ? (
                    <BottomPanel>

                        <SummaryInfoPanel 
                            locationName={covid19CasesByTimeQueryLocationName}
                            closeBtnOnClick={setCovid19CasesByTimeQueryResults.bind(this, null)}
                        />

                        <ChartPanel 
                            activeTrend={activeTrend}
                            data={covid19CasesByTimeQueryResults}
                        />
                    </BottomPanel>
                ) : null
            }


        </>
    )
}

export default App