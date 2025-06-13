import { useState, useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Skeleton,
    useTheme,
    Grid,
    FormControl,
    Select,
    InputLabel,
    Snackbar,
    Alert,
    CircularProgress,
    TablePagination,
} from "@mui/material";
import { format } from "date-fns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import axios from "axios";
import { serVer } from "../../Hooks/useVariable";

const AdminErrorLogs = () => {
    const theme = useTheme();
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const [filters, setFilters] = useState({
        userId: "",
        errorType: "",
        startDate: "",
        endDate: "",
        search: "",
    });
    const [expandedRows, setExpandedRows] = useState({});
    const [loadingStatus, setLoadingStatus] = useState({}); // Track loading per errorId
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { errorLogs = [] } = analyticsData || {};

    // Apply filters to error logs
    const filteredLogs = useMemo(() => {
        return errorLogs.filter((log) => {
            const matchesUserId = filters.userId
                ? log.userId?.email?.includes(filters.userId)
                : true;
            const matchesType = filters.errorType
                ? log.type === filters.errorType
                : true;
            const matchesStatus = filters.status
                ? log.status === filters.status
                : true;
            const matchesSearch = filters.search
                ? log.error.message
                      ?.toLowerCase()
                      .includes(filters.search.toLowerCase()) ||
                  log.error.stack
                      ?.toLowerCase()
                      .includes(filters.search.toLowerCase())
                : true;

            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const logDate = new Date(log.timestamp);
                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    if (logDate < startDate) matchesDate = false;
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    if (logDate > endDate) matchesDate = false;
                }
            }

            return (
                matchesUserId &&
                matchesType &&
                matchesStatus &&
                matchesDate &&
                matchesSearch
            );
        });
    }, [errorLogs, filters]);

    // Get paginated logs
    const paginatedLogs = useMemo(() => {
        return filteredLogs.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredLogs, page, rowsPerPage]);

    // Get unique error types for filter dropdown
    const errorTypes = useMemo(() => {
        return [...new Set(errorLogs.map((log) => log.type))];
    }, [errorLogs]);

    // Function to update error status
    const updateErrorStatus = async (errorId, newStatus) => {
        setLoadingStatus((prev) => ({ ...prev, [errorId]: true }));
        try {
            await axios.patch(`${serVer}/api/update-log-error/${errorId}`, {
                status: newStatus,
            });
            refetchAnalyticsData(); // Refresh data after update
            setSnackbar({
                open: true,
                message: "Error status updated successfully!",
            });
        } catch (error) {
            console.error("Failed to update error status:", error);
            alert("Failed to update error status. Please try again.");
        } finally {
            setLoadingStatus((prev) => ({ ...prev, [errorId]: false }));
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(0); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            userId: "",
            errorType: "",
            startDate: "",
            endDate: "",
            search: "",
        });
    };

    const handleExpandClick = (rowId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: "" });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Styled TableRow component
    const StyledTableRow = (props) => (
        <TableRow
            {...props}
            sx={{
                "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.info.dark}10 0%, ${theme.palette.grey[800]}30 100%)`,
                },
                ...props.sx,
            }}
        />
    );

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Error Logs
            </Typography>

            {/* Filter Section */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: theme.palette.background.paper,
                }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Search Error/Messages"
                            variant="outlined"
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="User email"
                            variant="outlined"
                            value={filters.userId}
                            onChange={(e) =>
                                handleFilterChange("userId", e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            fullWidth
                            select
                            label="Error Type"
                            variant="outlined"
                            value={filters.errorType}
                            onChange={(e) =>
                                handleFilterChange("errorType", e.target.value)
                            }>
                            <MenuItem value="">All Types</MenuItem>
                            {errorTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            fullWidth
                            select
                            label="Error Status"
                            variant="outlined"
                            value={filters.status}
                            onChange={(e) =>
                                handleFilterChange("status", e.target.value)
                            }>
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="fixed">Fixed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="ignored">Ignored</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            value={filters.startDate}
                            onChange={(e) =>
                                handleFilterChange("startDate", e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate}
                            onChange={(e) =>
                                handleFilterChange("endDate", e.target.value)
                            }
                        />
                    </Grid>
                </Grid>
                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={clearFilters}>
                        Clear Filters
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={refetchAnalyticsData}>
                        Refresh Data
                    </Button>
                </Box>
            </Paper>

            {/* Error Logs Table */}
            <TableContainer
                component={Paper}
                sx={{ maxHeight: "70vh", overflow: "auto" }}>
                <Table stickyHeader>
                    <TableHead
                        sx={{
                            "& .MuiTableCell-head": {
                                color: theme.palette.common.white,
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                background: theme.palette.primary.dark,
                            },
                        }}>
                        <TableRow>
                            <TableCell />
                            <TableCell>Timestamp</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Error</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isAnalyticsDataLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                  <TableRow key={index}>
                                      <TableCell>
                                          <Skeleton
                                              variant="circular"
                                              width={24}
                                              height={24}
                                          />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton variant="text" />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : paginatedLogs.map((log) => (
                                  <>
                                      <StyledTableRow key={log._id}>
                                          <TableCell>
                                              <IconButton
                                                  aria-label="expand row"
                                                  size="small"
                                                  onClick={() =>
                                                      handleExpandClick(log._id)
                                                  }>
                                                  {expandedRows[log._id] ? (
                                                      <ExpandLessIcon />
                                                  ) : (
                                                      <ExpandMoreIcon />
                                                  )}
                                              </IconButton>
                                          </TableCell>
                                          <TableCell>
                                              {format(
                                                  new Date(log.timestamp),
                                                  "MMM dd, yyyy HH:mm"
                                              )}
                                          </TableCell>
                                          <TableCell>
                                              <Chip
                                                  label={
                                                      log?.userId?.email ||
                                                      "N/A"
                                                  }
                                                  variant="outlined"
                                                  size="small"
                                                  color="primary"
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Chip
                                                  label={log.type}
                                                  size="small"
                                                  sx={{
                                                      backgroundColor:
                                                          log.type ===
                                                          "component"
                                                              ? theme.palette
                                                                    .error.light
                                                              : log.type ===
                                                                "global"
                                                              ? theme.palette
                                                                    .warning
                                                                    .light
                                                              : theme.palette
                                                                    .info.light,
                                                      color: theme.palette.getContrastText(
                                                          log.type ===
                                                              "component"
                                                              ? theme.palette
                                                                    .error.light
                                                              : log.type ===
                                                                "global"
                                                              ? theme.palette
                                                                    .warning
                                                                    .light
                                                              : theme.palette
                                                                    .info.light
                                                      ),
                                                  }}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              {log.error.name}
                                          </TableCell>
                                          <TableCell>
                                              {log.error.message}
                                          </TableCell>
                                          <TableCell>
                                              {loadingStatus[log._id] ? (
                                                  <CircularProgress
                                                      color="inherit"
                                                      size={20}
                                                  />
                                              ) : (
                                                  <Chip
                                                      label={
                                                          log.status ||
                                                          "Pending"
                                                      }
                                                      size="small"
                                                      sx={{
                                                          backgroundColor:
                                                              log.status ===
                                                              "fixed"
                                                                  ? theme
                                                                        .palette
                                                                        .success
                                                                        .light
                                                                  : log.status ===
                                                                    "ignored"
                                                                  ? theme
                                                                        .palette
                                                                        .grey[500]
                                                                  : theme
                                                                        .palette
                                                                        .warning
                                                                        .light,
                                                          color: theme.palette.getContrastText(
                                                              log.status ===
                                                                  "fixed"
                                                                  ? theme
                                                                        .palette
                                                                        .success
                                                                        .light
                                                                  : log.status ===
                                                                    "ignored"
                                                                  ? theme
                                                                        .palette
                                                                        .grey[500]
                                                                  : theme
                                                                        .palette
                                                                        .warning
                                                                        .light
                                                          ),
                                                      }}
                                                  />
                                              )}
                                          </TableCell>
                                      </StyledTableRow>
                                      <TableRow>
                                          <TableCell
                                              style={{
                                                  paddingBottom: 0,
                                                  paddingTop: 0,
                                              }}
                                              colSpan={7}>
                                              <Collapse
                                                  in={expandedRows[log._id]}
                                                  timeout="auto"
                                                  unmountOnExit>
                                                  <Box sx={{ margin: 1 }}>
                                                      <Typography
                                                          variant="h6"
                                                          gutterBottom
                                                          component="div">
                                                          Error Details
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>
                                                              Timestamp:
                                                          </strong>{" "}
                                                          {format(
                                                              new Date(
                                                                  log.timestamp
                                                              ),
                                                              "MMM dd, yyyy HH:mm:ss"
                                                          )}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>User:</strong>{" "}
                                                          {log?.userId?.email ||
                                                              "N/A"}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>
                                                              User Agent:
                                                          </strong>{" "}
                                                          {log.userAgent ||
                                                              "N/A"}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>Type:</strong>{" "}
                                                          {log.type}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>URL:</strong>{" "}
                                                          {log.url}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>
                                                              Error:
                                                          </strong>{" "}
                                                          {log.error.name}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          gutterBottom>
                                                          <strong>
                                                              Message:
                                                          </strong>{" "}
                                                          {log.error.message}
                                                      </Typography>
                                                      <Box mt={2}>
                                                          <FormControl
                                                              fullWidth
                                                              size="small">
                                                              <InputLabel
                                                                  id={`status-select-label-${log._id}`}>
                                                                  Status
                                                              </InputLabel>
                                                              <Select
                                                                  labelId={`status-select-label-${log._id}`}
                                                                  value={
                                                                      log.status ||
                                                                      "pending"
                                                                  }
                                                                  label="Status"
                                                                  onChange={(
                                                                      e
                                                                  ) =>
                                                                      updateErrorStatus(
                                                                          log._id,
                                                                          e
                                                                              .target
                                                                              .value
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      loadingStatus[
                                                                          log
                                                                              ._id
                                                                      ]
                                                                  }>
                                                                  <MenuItem value="fixed">
                                                                      Fixed
                                                                  </MenuItem>
                                                                  <MenuItem value="pending">
                                                                      Pending
                                                                  </MenuItem>
                                                                  <MenuItem value="ignored">
                                                                      Ignored
                                                                  </MenuItem>
                                                              </Select>
                                                          </FormControl>
                                                      </Box>
                                                      <Box mt={2}>
                                                          <Typography
                                                              variant="body2"
                                                              gutterBottom>
                                                              <strong>
                                                                  Context:
                                                              </strong>
                                                          </Typography>
                                                          <pre
                                                              style={{
                                                                  backgroundColor:
                                                                      theme
                                                                          .palette
                                                                          .grey[100],
                                                                  padding:
                                                                      "8px",
                                                                  borderRadius:
                                                                      "4px",
                                                                  maxHeight:
                                                                      "150px",
                                                                  overflow:
                                                                      "auto",
                                                              }}>
                                                              {JSON.stringify(
                                                                  log.context ||
                                                                      {},
                                                                  null,
                                                                  2
                                                              )}
                                                          </pre>
                                                      </Box>
                                                      <Box mt={2}>
                                                          <Typography
                                                              variant="body2"
                                                              gutterBottom>
                                                              <strong>
                                                                  Stack Trace:
                                                              </strong>
                                                          </Typography>
                                                          <pre
                                                              style={{
                                                                  backgroundColor:
                                                                      theme
                                                                          .palette
                                                                          .grey[100],
                                                                  padding:
                                                                      "8px",
                                                                  borderRadius:
                                                                      "4px",
                                                                  maxHeight:
                                                                      "200px",
                                                                  overflow:
                                                                      "auto",
                                                                  whiteSpace:
                                                                      "pre-wrap",
                                                              }}>
                                                              {log.error.stack}
                                                          </pre>
                                                      </Box>
                                                  </Box>
                                              </Collapse>
                                          </TableCell>
                                      </TableRow>
                                  </>
                              ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Table Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Success Toast Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    variant="filled"
                    color="primary"
                    sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminErrorLogs;
