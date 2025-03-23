import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bus, Save, Shield, Database, Bell, Cpu } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Bus className="h-6 w-6 text-primary" />
            <span>SmartTransit</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm font-medium">
              Dashboard
            </a>
            <a href="/routes" className="text-sm font-medium">
              Routes
            </a>
            <a href="/analytics" className="text-sm font-medium">
              Analytics
            </a>
            <a href="/settings" className="text-sm font-medium text-primary">
              Settings
            </a>
            <Button>Sign In</Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                <TabsTrigger value="data">Data Sources</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure basic system settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="system-name">System Name</Label>
                      <Input id="system-name" defaultValue="SmartTransit" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="utc-8">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                          <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                          <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                          <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units</Label>
                      <Select defaultValue="imperial">
                        <SelectTrigger id="units">
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (km, liters)</SelectItem>
                          <SelectItem value="imperial">Imperial (miles, gallons)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable dark mode for the interface</p>
                      </div>
                      <Switch id="dark-mode" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Model Configuration</CardTitle>
                    <CardDescription>Configure the AI models and optimization parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="model-type">Optimization Model</Label>
                      <Select defaultValue="reinforcement">
                        <SelectTrigger id="model-type">
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
                          <SelectItem value="predictive">Predictive Analytics</SelectItem>
                          <SelectItem value="hybrid">Hybrid Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="optimization-aggressiveness">Optimization Aggressiveness</Label>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Slider defaultValue={[75]} max={100} step={1} />
                      <p className="text-xs text-muted-foreground">
                        Higher values prioritize efficiency over stability. Lower values make more conservative changes.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prediction-horizon">Prediction Horizon</Label>
                        <span className="text-sm text-muted-foreground">24 hours</span>
                      </div>
                      <Slider defaultValue={[24]} max={72} step={1} />
                      <p className="text-xs text-muted-foreground">
                        How far into the future the AI should predict demand and traffic patterns.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-apply">Auto-Apply Recommendations</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically apply high-confidence AI recommendations
                        </p>
                      </div>
                      <Switch id="auto-apply" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="continuous-learning">Continuous Learning</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow the AI model to continuously learn from new data
                        </p>
                      </div>
                      <Switch id="continuous-learning" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Model Training</CardTitle>
                    <CardDescription>Configure AI model training parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="training-frequency">Training Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="training-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="training-data">Training Data Range</Label>
                      <Select defaultValue="90d">
                        <SelectTrigger id="training-data">
                          <SelectValue placeholder="Select data range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="180d">Last 180 days</SelectItem>
                          <SelectItem value="365d">Last 365 days</SelectItem>
                          <SelectItem value="all">All available data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Cpu className="mr-2 h-4 w-4" />
                      Retrain Models Now
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Source Configuration</CardTitle>
                    <CardDescription>Configure data sources and integration settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="gps-provider">GPS Data Provider</Label>
                      <Select defaultValue="internal">
                        <SelectTrigger id="gps-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal GPS System</SelectItem>
                          <SelectItem value="google">Google Maps API</SelectItem>
                          <SelectItem value="here">HERE Maps</SelectItem>
                          <SelectItem value="tomtom">TomTom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="traffic-provider">Traffic Data Provider</Label>
                      <Select defaultValue="google">
                        <SelectTrigger id="traffic-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Maps API</SelectItem>
                          <SelectItem value="here">HERE Maps</SelectItem>
                          <SelectItem value="tomtom">TomTom</SelectItem>
                          <SelectItem value="waze">Waze</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weather-provider">Weather Data Provider</Label>
                      <Select defaultValue="openweather">
                        <SelectTrigger id="weather-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openweather">OpenWeatherMap</SelectItem>
                          <SelectItem value="weatherapi">WeatherAPI</SelectItem>
                          <SelectItem value="accuweather">AccuWeather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="events-provider">Events Data Provider</Label>
                      <Select defaultValue="eventbrite">
                        <SelectTrigger id="events-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eventbrite">Eventbrite</SelectItem>
                          <SelectItem value="ticketmaster">Ticketmaster</SelectItem>
                          <SelectItem value="municipal">Municipal Calendar</SelectItem>
                          <SelectItem value="custom">Custom API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="real-time-sync">Real-time Data Synchronization</Label>
                        <p className="text-sm text-muted-foreground">Keep data synchronized in real-time</p>
                      </div>
                      <Switch id="real-time-sync" defaultChecked />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Database className="mr-2 h-4 w-4" />
                      Test Data Connections
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure system notifications and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch id="sms-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on mobile devices</p>
                      </div>
                      <Switch id="push-notifications" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Events</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-optimization" className="text-sm font-normal">
                            Route Optimization Suggestions
                          </Label>
                          <Switch id="notify-optimization" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-congestion" className="text-sm font-normal">
                            High Congestion Alerts
                          </Label>
                          <Switch id="notify-congestion" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-maintenance" className="text-sm font-normal">
                            Maintenance Alerts
                          </Label>
                          <Switch id="notify-maintenance" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-weather" className="text-sm font-normal">
                            Weather Impact Alerts
                          </Label>
                          <Switch id="notify-weather" defaultChecked />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Send Test Notification
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Configure system security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="auth-method">Authentication Method</Label>
                      <Select defaultValue="2fa">
                        <SelectTrigger id="auth-method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="password">Password Only</SelectItem>
                          <SelectItem value="2fa">Two-Factor Authentication</SelectItem>
                          <SelectItem value="sso">Single Sign-On (SSO)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="session-timeout">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="ip-restriction">IP Restriction</Label>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                      </div>
                      <Switch id="ip-restriction" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="audit-logging">Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">Log all system actions for audit purposes</p>
                      </div>
                      <Switch id="audit-logging" defaultChecked />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Security Audit
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

