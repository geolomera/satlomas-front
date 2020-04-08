import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import StationsFilterButton from "../components/StationsFilterButton";
import TimeRangeFilterButton from "../components/TimeRangeFilterButton";
import Head from "next/head";
import axios from "axios";
import { buildApiUrl } from "../utils/api";
import LinearProgress from "@material-ui/core/LinearProgress";
import ParameterPlot from "../components/ParameterPlot";

const REFRESH_INTERVAL_MS = 1000 * 60; // Refresh every 60 seconds
const DEFAULT_START = "2011-01-01T00:00";
const DEFAULT_END = "2012-01-01T00:00";

const styles = (theme) => ({
  appBar: {
    position: "relative",
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(1500 + theme.spacing.unit * 3 * 2)]: {
      width: 1500,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  grow: {
    flexGrow: 1,
  },
  rightButtons: {
    position: "relative",
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit,
      width: "auto",
    },
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 3}px 0`,
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6,
  },
  body: {
    fontFamily: "Roboto, sans-serif",
    fontSize: 10,
  },
});

const plots = [
  {
    key: "temperature",
    title: "Temperatura de Ambiente",
  },
  {
    key: "humidity",
    title: "Humedad Relativa",
  },
  {
    key: "wind_speed",
    title: "Velocidad del Viento",
  },
  {
    key: "wind_direction",
    title: "Dirección del Viento",
  },
  {
    key: "pressure",
    title: "Presión Atmosférica",
  },
  {
    key: "precipitation",
    title: "Precipitaciones (niebla)",
  },
  {
    key: "pm25",
    title: "Material Particulado (PM2.5)",
  },
];

class StationsDashboard extends React.Component {
  state = {
    loading: true,
    station: null,
    mode: "historic",
    realtimeParams: { now: null, lastTime: "1-year" },
    historicParams: { start: DEFAULT_START, end: DEFAULT_END },
    aggregationFunc: "avg",
    groupingInterval: "month",
    stationsAnchorEl: null,
    data: {},
  };

  static async getInitialProps({ query }) {
    return { namespacesRequired: ["common"], query };
  }

  async componentDidMount() {
    await this.fetchStations();

    const { query } = this.props;

    // Set station filter based on query param
    const { stations } = this.state;
    const station = query.id
      ? stations.find((station) => station.id === Number(query.id))
      : stations[0];

    // TODO Set time range filter based on query param
    // ...

    this.setState({ station, loading: false }, () => {
      this.setHistoricMode();
      // this.setRealtimeMode();
    });
  }

  setRealtimeMode() {
    this.updateNow();
    this.rtInterval = setInterval(() => this.updateNow(), REFRESH_INTERVAL_MS);
  }

  setHistoricMode() {
    this.setState({ mode: "historic" });
    this.rtInterval = null;
  }

  updateNow() {
    const now = new Date();

    console.log("Update now:", now);
    this.setState((prevState) => ({
      mode: "realtime",
      realtimeParams: { ...prevState.realtimeParams, now },
    }));
  }

  async fetchStations() {
    try {
      const response = await axios.get(buildApiUrl("/stations/"));
      this.setState({ stations: response.data });
    } catch (error) {
      // TODO Raise an error modal
      // ...
    }
  }

  handleStationsClick = (event) => {
    this.setState({ stationsAnchorEl: event.currentTarget });
  };

  handleStationsClose = () => {
    this.setState({ stationsAnchorEl: null });
  };

  handleStationsSelectChange = (e) => {
    const { stations } = this.state;
    const newId = e.target.value;
    const station = stations.find((st) => st.id === newId);
    this.setState({ station });
  };

  handleTimeRangeClick = (event) => {
    this.setState({ timeRangeAnchorEl: event.currentTarget });
  };

  handleTimeRangeClose = () => {
    this.setState({ timeRangeAnchorEl: null });
  };

  handleTimeRangeLastTimeSelectChange = (e) => {
    this.setState((prevState) => ({
      realtimeParams: {
        ...prevState.realtimeParams,
        lastTime: e.target.value,
      },
    }));
  };

  handleAggregationFunctionSelectChange = (e) => {
    this.setState({ aggregationFunc: e.target.value });
  };

  handleGroupingIntervalSelectChange = (e) => {
    this.setState({ groupingInterval: e.target.value });
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      stations,
      station,
      stationsAnchorEl,
      timeRangeAnchorEl,
      mode,
      realtimeParams,
      historicParams,
      groupingInterval,
      aggregationFunc,
    } = this.state;

    const timeRangeParams =
      mode === "realtime" ? realtimeParams : historicParams;

    return (
      <React.Fragment>
        <Head>
          <title>
            {station
              ? `GeoLomas - Dashboard: ${station.name}`
              : `GeoLomas - Dashboard de Estaciones`}
          </title>
        </Head>
        <CssBaseline />
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              {station
                ? `Dashboard: ${station.name}`
                : `Dashboard de Estaciones Meteorológicas`}
            </Typography>
            <div className={classes.grow} />
            <div className={classes.rightButtons}>
              <StationsFilterButton
                value={station && station.id}
                stations={stations}
                popoverOpen={Boolean(stationsAnchorEl)}
                anchorEl={stationsAnchorEl}
                onClick={this.handleStationsClick}
                onPopoverClose={this.handleStationsClose}
                onSelectChange={this.handleStationsSelectChange}
              />
              <TimeRangeFilterButton
                mode={mode}
                realtimeParams={realtimeParams}
                historicParams={historicParams}
                aggregationFunc={aggregationFunc}
                groupingInterval={groupingInterval}
                popoverOpen={Boolean(timeRangeAnchorEl)}
                anchorEl={timeRangeAnchorEl}
                onPopoverClose={this.handleTimeRangeClose}
                onClick={this.handleTimeRangeClick}
                onLastTimeSelectChange={
                  this.handleTimeRangeLastTimeSelectChange
                }
                onAggregationFunctionSelectChange={
                  this.handleAggregationFunctionSelectChange
                }
                onGroupingIntervalSelectChange={
                  this.handleGroupingIntervalSelectChange
                }
              />
            </div>
          </Toolbar>
        </AppBar>
        <main>
          {!loading && station ? (
            <div className={classNames(classes.layout, classes.cardGrid)}>
              <Grid container spacing={16}>
                {plots.map((plot) => (
                  <Grid item key={plot.key} sm={6} md={4} lg={4}>
                    <Card className={classes.card}>
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h6" component="h6">
                          {plot.title}
                        </Typography>
                        <ParameterPlot
                          station={station}
                          parameter={plot.key}
                          mode={mode}
                          timeRangeParams={timeRangeParams}
                          groupingInterval={groupingInterval}
                          aggregationFunc={aggregationFunc}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          ) : (
            <LinearProgress />
          )}
        </main>
      </React.Fragment>
    );
  }
}

StationsDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StationsDashboard);
