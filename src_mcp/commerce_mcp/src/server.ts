import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios"; 

// app version
const APP_VERSION = "1.3";

// types
type CommerceWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};
type PhotoMetadata = {
  id: string;
  author: string;
  download_url: string; 
};

// paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..", "..");
const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

// read widget HTML
function readWidgetHtml(componentName: string): string {
  const directPath = path.join(ASSETS_DIR, `${componentName}.html`);
  let htmlContents: string | null = null;
  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    const candidates = fs
      .readdirSync(ASSETS_DIR)
      .filter(
        (file) => file.startsWith(`${componentName}-`) && file.endsWith(".html")
      )
      .sort();
    const fallback = candidates[candidates.length - 1];
    if (fallback)
      htmlContents = fs.readFileSync(path.join(ASSETS_DIR, fallback), "utf8");
  }
  if (!htmlContents)
    throw new Error(`Widget HTML for "${componentName}" not found in ${ASSETS_DIR}. Run "pnpm run build" to generate the assets.`);
  return htmlContents;
}

// widget metadata
function widgetMeta(widget: CommerceWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

// widget [UPDATE POINT]
const widgets: CommerceWidget[] = [
  {
    id: "product-carousel",
    title: "Show Product Carousel",
    templateUri: "ui://widget/product-carousel.html",
    invoking: "Curating products",
    invoked: "Products ready to browse",
    html: readWidgetHtml("product-carousel"),
    responseText: "Displaying personalized product recommendations!",
  },
  {
    id: "checkout-page",
    title: "Show Checkout Page",
    templateUri: "ui://widget/checkout-page.html",
    invoking: "Preparing checkout",
    invoked: "Checkout ready",
    html: readWidgetHtml("checkout-page"),
    responseText: "Taking you to checkout to complete your purchase!",
  },
  {
    id: "shopping-cart",
    title: "Show Shopping Cart",
    templateUri: "ui://widget/shopping-cart.html",
    invoking: "Loading cart",
    invoked: "Cart loaded",
    html: readWidgetHtml("shopping-cart"),
    responseText: "Here's your shopping cart with all your items!",
  }
];

// widgets by id & uri
const widgetsById = new Map<string, CommerceWidget>();
const widgetsByUri = new Map<string, CommerceWidget>();
widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

// resources
const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget)
}));

// resource templates
const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget)
}));

// tool input schema
const toolInputSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "User's search query or product preferences (e.g., 'wireless headphones', 'running shoes under $150')"
    },
    category: {
      type: "string",
      description: "Product category to filter by (e.g., 'Electronics', 'Footwear', 'Accessories')",
      enum: ["Electronics", "Wearables", "Accessories", "Footwear", "Lifestyle", "Gaming", "All"]
    },
    priceRange: {
      type: "object",
      properties: {
        min: {
          type: "number",
          description: "Minimum price in USD"
        },
        max: {
          type: "number",
          description: "Maximum price in USD"
        }
      }
    },
    sortBy: {
      type: "string",
      description: "How to sort products",
      enum: ["price-low", "price-high", "rating", "popular", "newest"]
    }
  },
  required: ["query"],
  additionalProperties: false
} as const;

// input parser
const toolInputParser = z.object({
  query: z.string(),
  category: z.enum(["Electronics", "Wearables", "Accessories", "Footwear", "Lifestyle", "Gaming", "All"]).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  sortBy: z.enum(["price-low", "price-high", "rating", "popular", "newest"]).optional()
});

// MCP tools
const tools: Tool[] = widgets.map((widget) => ({
  name: widget.id,
  description: widget.title,
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
  // to disable the approval prompt for the widgets
  annotations: {
    destructiveHint: false,
    openWorldHint: false,
    readOnlyHint: true,
  },
}));

// mcp tool handlers [UPDATE POINT]
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  "product-carousel": async (args) => {
    // simulate API call delay
    await fetchRandomPhoto(); // Keep this to simulate async operation
    
    // return mock product data
    return {
      appVersion: APP_VERSION,
      query: args.query,
      category: args.category || "All",
      _instruction: "Products are displayed in the widget below. Do not list them in your response.",
      products: {
        items: [
          {
            id: 1,
            name: "Wireless Noise-Cancelling Headphones",
            price: 299.99,
            originalPrice: 399.99,
            rating: 4.8,
            reviews: 2847,
            thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            category: "Electronics",
            inStock: true,
            badge: "Best Seller"
          },
          {
            id: 2,
            name: "Smart Watch Series 9",
            price: 449.00,
            rating: 4.9,
            reviews: 5234,
            thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
            category: "Wearables",
            inStock: true,
            badge: "New Arrival"
          },
          {
            id: 3,
            name: "Premium Leather Backpack",
            price: 179.99,
            originalPrice: 229.99,
            rating: 4.7,
            reviews: 1092,
            thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
            category: "Accessories",
            inStock: true,
            badge: "Sale"
          },
          {
            id: 4,
            name: "Minimalist Running Shoes",
            price: 129.99,
            rating: 4.6,
            reviews: 3421,
            thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
            category: "Footwear",
            inStock: true
          },
          {
            id: 5,
            name: "Stainless Steel Water Bottle",
            price: 34.99,
            originalPrice: 49.99,
            rating: 4.9,
            reviews: 8762,
            thumbnail: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
            category: "Lifestyle",
            inStock: true,
            badge: "Eco-Friendly"
          },
          {
            id: 6,
            name: "Mechanical Keyboard RGB",
            price: 189.99,
            rating: 4.8,
            reviews: 4156,
            thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
            category: "Gaming",
            inStock: false
          }
        ],
        _displayOnly: true 
      },
      _meta: {
        totalProducts: 6,
        filteredBy: args.category || "All",
        sortedBy: args.sortBy || "default"
      }
    };
  },

"shopping-cart": async (args) => {
    // simulate API call delay
    await fetchRandomPhoto();
    
    return {
      appVersion: APP_VERSION,
      _instruction: "Shopping cart is displayed in the widget below. Do not list items in your response.",
      cart: {
        items: [
          {
            id: 1,
            name: "Wireless Noise-Cancelling Headphone",
            price: 299.99,
            originalPrice: 399.99,
            quantity: 1,
            thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
            category: "Electronics",
            inStock: true
          },
          {
            id: 2,
            name: "Smart Watch Series 9",
            price: 449.00,
            quantity: 1,
            thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
            category: "Wearables",
            inStock: true
          },
          {
            id: 3,
            name: "Premium Leather Backpack",
            price: 179.99,
            originalPrice: 229.99,
            quantity: 2,
            thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
            category: "Accessories",
            inStock: true
          }
        ],
        _displayOnly: true
      },
      _meta: {
        totalItems: 4,
        subtotal: 1108.97,
        tax: 99.81,
        shipping: 0,
        total: 1208.78
      }
    };
  },
  "checkout-page": async (args) => {
    // simulate API call delay
    await fetchRandomPhoto();
    
    return {
      appVersion: APP_VERSION,
      _instruction: "Checkout page is displayed in the widget below. Do not describe the checkout process in your response.",
      checkout: {
        items: [
          {
            id: 1,
            name: "Wireless Noise-Cancelling Headphone",
            price: 299.99,
            quantity: 1,
            thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Smart Watch Series 9",
            price: 449.00,
            quantity: 1,
            thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"
          },
          {
            id: 5,
            name: "Stainless Steel Water Bottle",
            price: 34.99,
            quantity: 2,
            thumbnail: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop"
          }
        ],
        _displayOnly: true
      },
      _meta: {
        subtotal: 818.97,
        tax: 73.71,
        shipping: 0,
        total: 892.68,
        step: args.step || 1
      }
    };
  }
};

// create MCP server
function createMCPServer(): Server {
  // init server
  const server = new Server(
    {
      name: "mcp-server-node",
      version: "0.1.0"
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  // list resources
  server.setRequestHandler(ListResourcesRequestSchema, async (_request: ListResourcesRequest) => {
    return { resources };
  });

  // read resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
    const widget = widgetsByUri.get(request.params.uri);
    if (!widget) {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }
    return {
      contents: [
        {
          uri: widget.templateUri,
          mimeType: "text/html+skybridge",
          text: widget.html,
          _meta: widgetMeta(widget)
        }
      ]
    };
  });

  // list resource templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async (_request: ListResourceTemplatesRequest) => ({
    resourceTemplates
  }));

  // list tools
  server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => ({
    tools
  }));

  // call tool
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const widget = widgetsById.get(request.params.name);
    if (!widget) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    // tool input args
    const args = toolInputParser.parse(request.params.arguments ?? {});

    // tool output handler
    const handler = toolHandlers[widget.id];
    const structuredContent = await handler(args);

    return {
      content: [
        {
          type: "text",
          text: widget.responseText
        }
      ],
      structuredContent,
      _meta: widgetMeta(widget)
    };
  });

  return server;
}

// session
type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};
const sessions = new Map<string, SessionRecord>();

// SSE & POST endpoint
const ssePath = "/mcp";
const postPath = "/mcp/messages";

// handle SSE request
async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createMCPServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error: Error) => {
    console.error("SSE transport error", error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
  }
}

// handle POST message
async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end("Unknown session");
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to process message");
    }
  }
}

// mcp host & port
const port = 8080;
const host = '0.0.0.0';

// create HTTP server
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  // parse URL
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  // CORS preflight
  if (req.method === "OPTIONS" && (url.pathname === ssePath || url.pathname === postPath)) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type"
    });
    res.end();
    return;
  }

  // handle SSE connection
  if (req.method === "GET" && url.pathname === ssePath) {
    await handleSseRequest(res);
    return;
  }

  // handle POST message
  if (req.method === "POST" && url.pathname === postPath) {
    await handlePostMessage(req, res, url);
    return;
  }

  // not found
  res.writeHead(404).end("Not Found");
});
httpServer.on("clientError", (err: Error, socket) => {
  console.error("HTTP client error", err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
httpServer.listen(port, host, () => {
  console.log(`MCP server listening on http://${host}:${port}`);
  console.log(`  SSE stream: GET http://${host}:${port}${ssePath}`);
  console.log(`  Message post endpoint: POST http://${host}:${port}${postPath}?sessionId=...`);
});

// fetch random photo
async function fetchRandomPhoto() {
  try {
    const randomPage = Math.floor(Math.random() * 5) + 1; 
    const response = await axios.get(`https://picsum.photos/v2/list?page=${randomPage}&limit=10`);
    const photos: string[] = response.data.map((photo: PhotoMetadata) => photo.download_url);
    return photos; 
  } catch (error) {
    console.error('Error fetching random photo details:', error);
    return null;
  }
}