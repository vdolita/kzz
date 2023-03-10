import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

export default function LectureRotation() {
  return (
    <>
      <h6>自动轮播</h6>
      <List>
        <ListItem alignItems="flex-start">
          <ListItemText sx={{ flexGrow: 0 }} primary="轮播间隔" />
          <Box sx={{ flexGrow: 1 }}>
            <FormControl size="small">
              <InputLabel>时间单位</InputLabel>
              <Select>
                <MenuItem value={10}>10s</MenuItem>
                <MenuItem value={20}>20s</MenuItem>
                <MenuItem value={30}>30s</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </ListItem>
        <ListItem></ListItem>
        <ListItem></ListItem>
      </List>
    </>
  );
}
