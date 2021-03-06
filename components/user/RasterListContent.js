import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  Typography,
  Table,
  TableBody,
  Tooltip,
  TableHead,
  TableRow,
  TableContainer,
  TableCell,
  IconButton,
} from "@material-ui/core";
import { i18n, withTranslation } from "../../i18n";
import Moment from "react-moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import GetAppIcon from "@material-ui/icons/GetApp";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { withSnackbar } from "notistack";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import FileDownload from "../../utils/file-download";
import Link from "next/link";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  importBtn: {
    float: "right",
  },
});

let RasterTable = (props) => {
  const { t, classes, rows, downloadHandler } = props;
  const locale = i18n.language;

  return (
    <Paper className={classes.root}>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Slug</TableCell>
              <TableCell>Periodo</TableCell>
              <TableCell>Archivo</TableCell>
              <TableCell>Fecha de creación</TableCell>
              <TableCell>Fecha de modificación</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id + row.type}>
                <TableCell>{row.slug}</TableCell>
                <TableCell>{row.periodReadeable}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Moment locale={locale} fromNow>
                    {row.created_at}
                  </Moment>
                </TableCell>
                <TableCell>
                  <Moment locale={locale} fromNow>
                    {row.updated_at}
                  </Moment>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Copy URL">
                    <CopyToClipboard text={row.tiles_url}>
                      <IconButton>
                        <FileCopyIcon />
                      </IconButton>
                    </CopyToClipboard>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() =>
                        downloadHandler(row.id, row.name, row.type)
                      }
                      aria-label="Editar regla"
                    >
                      <GetAppIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

RasterTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

RasterTable = withStyles(styles)(RasterTable);
RasterTable = withTranslation(["me", "common"])(RasterTable);

const typeBasePaths = {
  eoSensors: "/eo-sensors",
};

class RasterListContent extends React.Component {
  state = {
    rows: [],
  };
  constructor(props) {
    super(props);
    this.downloadRaster = this.downloadRaster.bind(this);
  }

  async componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const { token } = this.props;

    const response = await axios.get(buildApiUrl("/eo-sensors/rasters"), {
      headers: { "Accept-Language": i18n.language, Authorization: token },
    });
    let result = response.data;
    for (var i = 0; i < result.length; i++) {
      result[i]["type"] = "eo-sensors";
      result[i][
        "periodReadeable"
      ] = `${result[i]["period"]["date_from"]} - ${result[i]["period"]["date_to"]}`;
    }

    result.sort(function (a, b) {
      if (a["period"]["date_from"] > ["period"]["date_from"]) {
        return -1;
      }
      if (b["period"]["date_from"] > a["period"]["date_from"]) {
        return 1;
      }
      return 0;
    });

    this.setState({ rows: result });
  }

  downloadRaster(id, name, type) {
    axios
      .get(buildApiUrl(`${typeBasePaths[type]}/download-raster/${id}`), {
        headers: { Authorization: this.props.token },
        responseType: "blob",
      })
      .then((response) => {
        FileDownload(response.data, name);
      });
  }

  render() {
    const { classes } = this.props;
    const { rows } = this.state;

    return (
      <div className={classes.root}>
        <Typography variant="h6" className={classes.title} gutterBottom>
          Imágenes
          <Link href="/user/rasters/import-perusat">
            <Button className={classes.importBtn}>Importar PeruSat-1</Button>
          </Link>
        </Typography>

        <RasterTable rows={rows} downloadHandler={this.downloadRaster} />
      </div>
    );
  }
}

RasterListContent = withSnackbar(RasterListContent);
RasterListContent = withStyles(styles)(RasterListContent);

export default RasterListContent;
