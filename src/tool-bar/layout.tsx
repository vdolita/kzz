import { Box } from "@mui/material";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "lightpink",
      }}
    >
      {children}
    </Box>
  );
}
