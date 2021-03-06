import React, { FunctionComponent, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps, Route, Redirect, Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Link from './Link';
import { untilNthIndex, capitalizeFirst, capitalizeEach, randomElement } from '../utils';
import CardWithPicture from './CardWithPicture';
import ProfileCard from './ProfileCard';
import SectionSelector from './SectionSelector';
import { useGlobalState } from '../stores';
import { sansSerifFont, shadowText, shadow } from '../styles';
import { COLORS, ColorGradient, Color } from '../colors';
import {
  VictoryChart,
  VictoryTheme,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryScatter,
} from 'victory';
import Achievement from './Achievement';
import { navigateTab } from '../stores/tab';
import { login, AuthState, Track } from '../stores/auth';

interface Props extends RouteComponentProps {}

function ordinalSuffix(i: number) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

interface ExerciseCardProps {
  imgSrc?: string;
  name: string;
  rank?: number;
  achievement?: { name: string; scheme: ColorGradient; icon: string; description: string };
}
const ExerciseCard: FunctionComponent<ExerciseCardProps> = ({
  imgSrc,
  name,
  rank,
  achievement,
}) => (
  <CardWithPicture imgSrc={imgSrc}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        ...sansSerifFont,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '0',
        }}
      >
        <span
          style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            lineHeight: '1.5rem',
            display: 'block',
            maxWidth: 'calc(100% - 32px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {rank ? (
          <span style={{ fontSize: '0.9rem' }}>
            <span
              style={{
                fontSize: '1.1rem',
                lineHeight: '1.5rem',
              }}
            >
              {rank}
              <span
                style={{
                  fontSize: '0.8rem',
                  lineHeight: '1.5rem',
                  display: 'inline-block',
                  transform: 'translateY(-0.4rem)',
                }}
              >
                {ordinalSuffix(rank)}
              </span>
            </span>
          </span>
        ) : null}
      </div>
      {achievement ? (
        <div
          style={{
            width: '100%',
            backgroundColor: COLORS.gray!.lightest,
            height: '1px',
            margin: '.4rem 0',
          }}
        />
      ) : null}
      {achievement ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: COLORS.gray!.dark }}>RECENT ACHIEVEMENT</span>
          <span style={{ fontSize: '1rem' }}>
            <Achievement {...achievement} />
          </span>
        </div>
      ) : null}
    </div>
  </CardWithPicture>
);

const WorkoutChart: FunctionComponent = () => {
  const [width, setWidth] = useState(window.innerWidth);

  const adjust = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener('resize', adjust);
    return () => {
      window.removeEventListener('resize', adjust);
    };
  }, []);
  const [auth] = useGlobalState('auth');

  const description = 'Last week, overall points';
  const data = [
    { x: '20190529', y: 0 },
    { x: '20190530', y: 0 },
    { x: '20190531', y: 0 },
    { x: '20190601', y: 0 },
    { x: '20190602', y: 0 },
    { x: '20190603', y: 0 },
    { x: '20190604', y: auth.points },
  ];

  return (
    <>
      <div
        style={{
          fontSize: '0.8rem',
          width: '100%',
          height: '0',
          textAlign: 'right',
          margin: '1.5em 2.3em -1.7em -2.3em',
          color: COLORS.gray!.dark,
          position: 'relative',
          zIndex: 999999,
        }}
      >
        {description}
      </div>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="myGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#586fef" />
            <stop offset="100%" stopColor="#88cbfe" />
          </linearGradient>
        </defs>
      </svg>
      <VictoryChart width={width} height={300}>
        <VictoryArea
          style={{
            data: { fill: 'url(#myGradient)' },
          }}
          interpolation="cardinal"
          data={data}
        />
        <VictoryAxis
          tickFormat={(t: string) => `${t.slice(4, 6)}/${t.slice(6, 8)}`}
          style={{
            axis: { stroke: 'none' },
            grid: { stroke: 'none' },
            tickLabels: {
              fontSize: 13,
            },
            axisLabel: {
              fill: `${COLORS.gray!.normal}!important`,
            },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: 'none' },
            grid: {
              stroke: new Color(COLORS.gray!.dark).changeA(0.25).toHexWithA(),
              transform: `scaleX(${1.095 - window.innerWidth / 11000})`,
            },
            tickLabels: {
              fontSize: 13,
            },
            axisLabel: {
              fill: `${COLORS.gray!.normal}!important`,
            },
          }}
        />
        <VictoryScatter
          data={data}
          size={6}
          style={{
            data: {
              fill: 'white',
              stroke: '#586fef',
              strokeWidth: 3,
              borderRadius: '1px',
              WebkitAppearance: 'none',
              boxShadow: shadowText({
                depth: 2,
                color: new Color('#586fef'),
              }),
            },
          }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </>
  );
};

const Profile: FunctionComponent<Props> = ({ location, history }) => {
  const [ath] = useGlobalState('auth');
  const auth = ath
    ? ath
    : {
        id: '',
        name: '',
        points: 0,
        level: 0,
        profileImagePath: '',
        profileImage: '',
        profileMessage: '',
        gym: '',
        friends: [],
        track: [] as Track[],
      };
  useEffect(() => {
    if (auth.id === '') {
      history.push('/login?redirect=profile');
      navigateTab('');
    }
  });
  const [section, setSection] = useState(0);
  const [staticInfo] = useGlobalState('static');

  const [overview, setOverview] = useState({} as { [name: string]: number });
  let tempObj = {} as { [name: string]: number };
  useEffect(() => {
    tempObj = {} as { [name: string]: number };
    for (let i = 0; i < (auth.track || []).length; i += 1) {
      if (tempObj[auth.track[i].name]) {
        tempObj[auth.track[i].name] += auth.track[i].points || 0;
      } else {
        tempObj[auth.track[i].name] = auth.track[i].points || 0;
      }
    }
    setOverview(tempObj);
  }, [(auth.track || []).length]);

  return (
    <Route
      render={() => (
        <TransitionGroup className="top-level" style={{ height: '100vh', position: 'absolute' }}>
          <CSSTransition
            key={untilNthIndex(location.pathname, '/', 3)}
            timeout={{ enter: 300, exit: 300 }}
            classNames={'content--fade-transition'}
          >
            <div>
              <Route
                path="/profile"
                render={() => (
                  <div className="fade">
                    <div className="content">
                      <h1 className="heading">Profile</h1>
                      <ProfileCard
                        imgSrc={auth.profileImage}
                        alt={`Profile image of ${auth.name}`}
                        name={auth.name}
                        id={auth.id}
                        gym={auth.gym}
                        level={auth.level}
                        points={auth.points}
                        prevMaxPoints={((staticInfo.others.levels || [0]) as number[])
                          .slice(0, auth.level)
                          .reduce((a, b) => a + b, 0)}
                        maxPoints={((staticInfo.others.levels || [0]) as number[])
                          .slice(0, auth.level + 1)
                          .reduce((a, b) => a + b, 0)}
                        message={auth.profileMessage}
                      />
                      <SectionSelector
                        onChange={(v, i) => {
                          setSection(i);
                        }}
                        labels={['Overview', 'Trends']}
                      />
                      {section === 0 ? (
                        <>
                          {[...Object.keys(overview)]
                            .sort((n1, n2) => overview[n2] - overview[n1])
                            .map((name, i) => (
                              <ExerciseCard
                                key={i}
                                rank={i + 1}
                                imgSrc={(staticInfo.workoutInfo[name] || {}).image}
                                name={capitalizeEach(name)}
                                achievement={{
                                  name: `${capitalizeEach(name)} Beginner`,
                                  icon: '',
                                  scheme: randomElement([
                                    COLORS.red!,
                                    COLORS.orange!,
                                    COLORS.green!,
                                    COLORS.blue!,
                                    COLORS.gray!,
                                  ])!,
                                  description: `Do the workout ${name} once.`,
                                }}
                              />
                            ))}
                        </>
                      ) : (
                        <div
                          style={{
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            margin: '1rem 0',
                            borderRadius: '8px',
                            WebkitAppearance: 'none',
                            boxShadow: shadowText({
                              depth: 4,
                              color: new Color(COLORS.gray!.darker),
                            }),
                          }}
                        >
                          <WorkoutChart />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          </CSSTransition>
        </TransitionGroup>
      )}
    />
  );
};

export default withRouter(Profile);
