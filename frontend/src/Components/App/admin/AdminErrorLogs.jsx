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
} from "@mui/material";
import { format } from "date-fns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";

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

    const { errorLogs = [] } = analyticsData || {};

    // Apply filters to error logs
    const filteredLogs = useMemo(() => {
        return errorLogs.filter((log) => {
            const matchesUserId = filters.userId
                ? log.context?.userId?.includes(filters.userId)
                : true;
            const matchesType = filters.errorType
                ? log.type === filters.errorType
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

            return matchesUserId && matchesType && matchesDate && matchesSearch;
        });
    }, [errorLogs, filters]);

    // Get unique error types for filter dropdown
    const errorTypes = useMemo(() => {
        return [...new Set(errorLogs.map((log) => log.type))];
    }, [errorLogs]);

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
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
                    <Grid size={{ xs: 6, md: 12 }}>
                        <TextField
                            fullWidth
                            label="User ID"
                            variant="outlined"
                            value={filters.userId}
                            onChange={(e) =>
                                handleFilterChange("userId", e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
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
                    <Grid size={{ xs: 6, md: 4 }}>
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
                    <Grid size={{ xs: 6, md: 4 }}>
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
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Timestamp</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Error</TableCell>
                            <TableCell>Message</TableCell>
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
                                  </TableRow>
                              ))
                            : filteredLogs.map((log) => (
                                  <>
                                      <TableRow key={log._id}>
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
                                                      log.context?.userId ||
                                                      "Unknown"
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
                                      </TableRow>
                                      <TableRow>
                                          <TableCell
                                              style={{
                                                  paddingBottom: 0,
                                                  paddingTop: 0,
                                              }}
                                              colSpan={6}>
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
                                                          {log.context
                                                              ?.userId ||
                                                              "Unknown"}
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
        </Box>
    );
};

export default AdminErrorLogs;
