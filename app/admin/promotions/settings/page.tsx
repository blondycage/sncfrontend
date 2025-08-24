'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  DollarSign, 
  Clock, 
  Globe, 
  Shield, 
  Save,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { adminPromotionsApi } from '@/lib/api';

interface PromotionConfig {
  pricing: {
    homepage: {
      priceUSD: number;
      maxDuration: number;
      minDuration: number;
      maxConcurrent: number;
    };
    category_top: {
      priceUSD: number;
      maxDuration: number;
      minDuration: number;
      maxConcurrent: number;
    };
  };
  chains: Array<{
    name: string;
    displayName: string;
    enabled: boolean;
    walletAddress: string;
    explorerUrl: string;
    symbol: string;
  }>;
  general: {
    autoApprove: boolean;
    requireScreenshot: boolean;
    maxPendingDays: number;
    notificationEmail: string;
    terms: string;
    instructions: string;
  };
  moderation: {
    requireApproval: boolean;
    autoRejectAfterDays: number;
    allowedCategories: string[];
    blockedWords: string[];
  };
}

export default function PromotionSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [config, setConfig] = useState<PromotionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');

  const [newChain, setNewChain] = useState({
    name: '',
    displayName: '',
    enabled: true,
    walletAddress: '',
    explorerUrl: '',
    symbol: ''
  });

  const [newBlockedWord, setNewBlockedWord] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminPromotionsApi.getConfig();
      
      if (response.success) {
        setConfig(response.data || getDefaultConfig());
      } else {
        setConfig(getDefaultConfig());
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfig = (): PromotionConfig => ({
    pricing: {
      homepage: {
        priceUSD: 100,
        maxDuration: 30,
        minDuration: 1,
        maxConcurrent: 3
      },
      category_top: {
        priceUSD: 50,
        maxDuration: 30,
        minDuration: 1,
        maxConcurrent: 5
      }
    },
    chains: [
      {
        name: 'ethereum',
        displayName: 'Ethereum',
        enabled: true,
        walletAddress: '',
        explorerUrl: 'https://etherscan.io/tx/',
        symbol: 'ETH'
      },
      {
        name: 'polygon',
        displayName: 'Polygon',
        enabled: true,
        walletAddress: '',
        explorerUrl: 'https://polygonscan.com/tx/',
        symbol: 'MATIC'
      },
      {
        name: 'bsc',
        displayName: 'Binance Smart Chain',
        enabled: true,
        walletAddress: '',
        explorerUrl: 'https://bscscan.com/tx/',
        symbol: 'BNB'
      }
    ],
    general: {
      autoApprove: false,
      requireScreenshot: true,
      maxPendingDays: 7,
      notificationEmail: '',
      terms: '',
      instructions: ''
    },
    moderation: {
      requireApproval: true,
      autoRejectAfterDays: 14,
      allowedCategories: ['Housing', 'Jobs', 'Services', 'Items for Sale'],
      blockedWords: []
    }
  });

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await adminPromotionsApi.updateConfig(config);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Promotion settings saved successfully'
        });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    if (!config) return;

    const pathArray = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;

    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }

    current[pathArray[pathArray.length - 1]] = value;
    setConfig(newConfig);
  };

  const addChain = () => {
    if (!config || !newChain.name || !newChain.displayName) return;

    const newChains = [...config.chains, { ...newChain }];
    updateConfig('chains', newChains);
    setNewChain({
      name: '',
      displayName: '',
      enabled: true,
      walletAddress: '',
      explorerUrl: '',
      symbol: ''
    });
  };

  const removeChain = (index: number) => {
    if (!config) return;
    const newChains = config.chains.filter((_, i) => i !== index);
    updateConfig('chains', newChains);
  };

  const updateChain = (index: number, field: string, value: any) => {
    if (!config) return;
    const newChains = [...config.chains];
    (newChains[index] as any)[field] = value;
    updateConfig('chains', newChains);
  };

  const addBlockedWord = () => {
    if (!config || !newBlockedWord.trim()) return;
    const newWords = [...config.moderation.blockedWords, newBlockedWord.trim().toLowerCase()];
    updateConfig('moderation.blockedWords', newWords);
    setNewBlockedWord('');
  };

  const removeBlockedWord = (word: string) => {
    if (!config) return;
    const newWords = config.moderation.blockedWords.filter(w => w !== word);
    updateConfig('moderation.blockedWords', newWords);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load settings</h3>
          <Button onClick={fetchConfig}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Promotion Settings</h1>
          <p className="text-gray-600 mt-1">Configure promotion pricing, chains, and policies</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="chains">Blockchains</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
            </TabsList>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Homepage Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Homepage Hero
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="homepage-price">Price (USD)</Label>
                      <Input
                        id="homepage-price"
                        type="number"
                        value={config.pricing.homepage.priceUSD}
                        onChange={(e) => updateConfig('pricing.homepage.priceUSD', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage-min">Min Duration (days)</Label>
                        <Input
                          id="homepage-min"
                          type="number"
                          value={config.pricing.homepage.minDuration}
                          onChange={(e) => updateConfig('pricing.homepage.minDuration', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage-max">Max Duration (days)</Label>
                        <Input
                          id="homepage-max"
                          type="number"
                          value={config.pricing.homepage.maxDuration}
                          onChange={(e) => updateConfig('pricing.homepage.maxDuration', parseInt(e.target.value) || 30)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage-concurrent">Max Concurrent</Label>
                      <Input
                        id="homepage-concurrent"
                        type="number"
                        value={config.pricing.homepage.maxConcurrent}
                        onChange={(e) => updateConfig('pricing.homepage.maxConcurrent', parseInt(e.target.value) || 3)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Category Top Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Category Top
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="category-price">Price (USD)</Label>
                      <Input
                        id="category-price"
                        type="number"
                        value={config.pricing.category_top.priceUSD}
                        onChange={(e) => updateConfig('pricing.category_top.priceUSD', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category-min">Min Duration (days)</Label>
                        <Input
                          id="category-min"
                          type="number"
                          value={config.pricing.category_top.minDuration}
                          onChange={(e) => updateConfig('pricing.category_top.minDuration', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-max">Max Duration (days)</Label>
                        <Input
                          id="category-max"
                          type="number"
                          value={config.pricing.category_top.maxDuration}
                          onChange={(e) => updateConfig('pricing.category_top.maxDuration', parseInt(e.target.value) || 30)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category-concurrent">Max Concurrent</Label>
                      <Input
                        id="category-concurrent"
                        type="number"
                        value={config.pricing.category_top.maxConcurrent}
                        onChange={(e) => updateConfig('pricing.category_top.maxConcurrent', parseInt(e.target.value) || 5)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Chains Tab */}
            <TabsContent value="chains" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Supported Blockchains</h3>
                
                {config.chains.map((chain, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Display Name</Label>
                          <Input
                            value={chain.displayName}
                            onChange={(e) => updateChain(index, 'displayName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Symbol</Label>
                          <Input
                            value={chain.symbol}
                            onChange={(e) => updateChain(index, 'symbol', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={chain.enabled}
                              onCheckedChange={(checked) => updateChain(index, 'enabled', checked)}
                            />
                            <Label>Enabled</Label>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeChain(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Wallet Address</Label>
                          <Input
                            value={chain.walletAddress}
                            onChange={(e) => updateChain(index, 'walletAddress', e.target.value)}
                            placeholder="0x..."
                          />
                        </div>
                        <div>
                          <Label>Explorer URL</Label>
                          <Input
                            value={chain.explorerUrl}
                            onChange={(e) => updateChain(index, 'explorerUrl', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Chain */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add New Blockchain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Name (ID)</Label>
                        <Input
                          value={newChain.name}
                          onChange={(e) => setNewChain(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ethereum"
                        />
                      </div>
                      <div>
                        <Label>Display Name</Label>
                        <Input
                          value={newChain.displayName}
                          onChange={(e) => setNewChain(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Ethereum"
                        />
                      </div>
                      <div>
                        <Label>Symbol</Label>
                        <Input
                          value={newChain.symbol}
                          onChange={(e) => setNewChain(prev => ({ ...prev, symbol: e.target.value }))}
                          placeholder="ETH"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Wallet Address</Label>
                        <Input
                          value={newChain.walletAddress}
                          onChange={(e) => setNewChain(prev => ({ ...prev, walletAddress: e.target.value }))}
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <Label>Explorer URL</Label>
                        <Input
                          value={newChain.explorerUrl}
                          onChange={(e) => setNewChain(prev => ({ ...prev, explorerUrl: e.target.value }))}
                          placeholder="https://etherscan.io/tx/"
                        />
                      </div>
                    </div>
                    <Button onClick={addChain} disabled={!newChain.name || !newChain.displayName}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Blockchain
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Approve Payments</Label>
                        <p className="text-sm text-gray-500">Automatically approve valid payments</p>
                      </div>
                      <Switch
                        checked={config.general.autoApprove}
                        onCheckedChange={(checked) => updateConfig('general.autoApprove', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Screenshot</Label>
                        <p className="text-sm text-gray-500">Require payment screenshot upload</p>
                      </div>
                      <Switch
                        checked={config.general.requireScreenshot}
                        onCheckedChange={(checked) => updateConfig('general.requireScreenshot', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-pending">Max Pending Days</Label>
                      <Input
                        id="max-pending"
                        type="number"
                        value={config.general.maxPendingDays}
                        onChange={(e) => updateConfig('general.maxPendingDays', parseInt(e.target.value) || 7)}
                      />
                      <p className="text-sm text-gray-500 mt-1">Days to keep pending payments before auto-rejection</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="notification-email">Notification Email</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={config.general.notificationEmail}
                        onChange={(e) => updateConfig('general.notificationEmail', e.target.value)}
                        placeholder="admin@example.com"
                      />
                      <p className="text-sm text-gray-500 mt-1">Email for payment notifications</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Terms & Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={config.general.terms}
                      onChange={(e) => updateConfig('general.terms', e.target.value)}
                      rows={6}
                      placeholder="Enter terms and conditions for promotions..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Payment Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={config.general.instructions}
                      onChange={(e) => updateConfig('general.instructions', e.target.value)}
                      rows={4}
                      placeholder="Enter payment instructions for users..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Manual Approval</Label>
                      <p className="text-sm text-gray-500">All promotions require admin approval</p>
                    </div>
                    <Switch
                      checked={config.moderation.requireApproval}
                      onCheckedChange={(checked) => updateConfig('moderation.requireApproval', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto-reject">Auto-reject After (days)</Label>
                    <Input
                      id="auto-reject"
                      type="number"
                      value={config.moderation.autoRejectAfterDays}
                      onChange={(e) => updateConfig('moderation.autoRejectAfterDays', parseInt(e.target.value) || 14)}
                    />
                    <p className="text-sm text-gray-500 mt-1">Days to wait before auto-rejecting unreviewed submissions</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Filtering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Blocked Words</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={newBlockedWord}
                        onChange={(e) => setNewBlockedWord(e.target.value)}
                        placeholder="Add blocked word..."
                        onKeyPress={(e) => e.key === 'Enter' && addBlockedWord()}
                      />
                      <Button onClick={addBlockedWord} disabled={!newBlockedWord.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.moderation.blockedWords.map((word, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {word}
                          <button
                            onClick={() => removeBlockedWord(word)}
                            className="ml-1 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Reminder */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <Info className="h-5 w-5" />
            <p className="text-sm">
              Remember to save your changes when you're done configuring the settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
