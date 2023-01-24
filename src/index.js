import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { AuthProvider } from "./context/AuthContext";
import DarkProvider from "./context/DarkContext";
import ViewsProvider from "./context/ViewsContext";
import BlockedProvider from "./context/BlockedContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<BrowserRouter>
		<AppProvider>
			<AuthProvider>
				<SubscriptionProvider>
					<DarkProvider>
						<ViewsProvider>
							<BlockedProvider>
								<App />
							</BlockedProvider>
						</ViewsProvider>
					</DarkProvider>
				</SubscriptionProvider>
			</AuthProvider>
		</AppProvider>
	</BrowserRouter>
);
