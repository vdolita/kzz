import { Box, Grid } from "@mui/material";
import LectureRotation from "./lecture-rotation";

export default function AutoHelper() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <LectureRotation />
        </Grid>
        <Grid item xs={4}>
          sf
        </Grid>
        <Grid item xs={4}>
          gd
        </Grid>
      </Grid>
    </Box>
  );
}
