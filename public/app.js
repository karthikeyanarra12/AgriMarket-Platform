function agriApp() {
    return {
        currentTab: 'market',
        selectedCrop: 'Tomatoes',
        crops: ['Tomatoes', 'Wheat', 'Corn', 'Potatoes', 'Soybeans'],
        prices: [],
        newListing: {
            crop_name: 'Tomatoes',
            grade: 'Grade A (Premium)',
            volume: 500,
            expected_price: 2.30,
            location: 'Central Valley'
        },
        aiResult: null,
        contracts: [],
        apiBase: '/api',

        async initApp() {
            console.log('Initializing AgriMarket App');
            await this.fetchPrices();
            await this.fetchContracts();
        },

        async fetchPrices() {
            try {
                const response = await fetch(`${this.apiBase}/prices/${this.selectedCrop}`);
                if (response.ok) {
                    this.prices = await response.json();
                } else {
                    console.error('Failed to fetch prices');
                    this.loadMockPrices();
                }
            } catch (error) {
                console.error('Error fetching prices:', error);
                this.loadMockPrices();
            }
        },

        loadMockPrices() {
            const mockData = {
                'Tomatoes': [
                    { id: 1, crop_name: 'Tomatoes', grade: 'Grade A', region: 'Central Valley', price_per_kg: 2.45, trend: 'Stable 📈' },
                    { id: 2, crop_name: 'Tomatoes', grade: 'Grade B', region: 'North Region', price_per_kg: 1.95, trend: 'Rising 🚀' }
                ],
                'Wheat': [
                    { id: 3, crop_name: 'Wheat', grade: 'Grade A', region: 'West Plains', price_per_kg: 1.20, trend: 'Stable 📈' },
                    { id: 4, crop_name: 'Wheat', grade: 'Grade B', region: 'South Valley', price_per_kg: 0.95, trend: 'Steady 📊' }
                ],
                'Corn': [
                    { id: 5, crop_name: 'Corn', grade: 'Grade A', region: 'Midwest Hub', price_per_kg: 1.10, trend: 'Rising 🚀' }
                ],
                'Potatoes': [
                    { id: 6, crop_name: 'Potatoes', grade: 'Grade A', region: 'Hillside', price_per_kg: 0.85, trend: 'Stable 📈' }
                ],
                'Soybeans': [
                    { id: 7, crop_name: 'Soybeans', grade: 'Grade A', region: 'Delta Region', price_per_kg: 3.10, trend: 'High Demand 🔥' }
                ]
            };
            this.prices = mockData[this.selectedCrop] || mockData['Tomatoes'];
        },

        async submitListing() {
            try {
                const response = await fetch(`${this.apiBase}/ai-price-check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        crop_name: this.newListing.crop_name,
                        expected_price: parseFloat(this.newListing.expected_price)
                    })
                });

                if (response.ok) {
                    this.aiResult = await response.json();
                } else {
                    throw new Error('AI check failed');
                }

                alert('Listing successfully created and validated by AI Pricing Assistant!');
            } catch (error) {
                console.error('Error submitting listing:', error);
                alert('Error processing listing. Please try again.');
            }
        },

        async quickBuy(item) {
            try {
                const contractHash = '0x' + Math.random().toString(16).substring(2, 34);
                const response = await fetch(`${this.apiBase}/contracts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contract_hash: contractHash,
                        crop_name: `${item.crop_name} (${item.grade})`,
                        agreed_price: item.price_per_kg * 500,
                        deposit_amount: item.price_per_kg * 500 * 0.25,
                        buyer_id: 1,
                        seller_id: 2
                    })
                });

                if (response.ok) {
                    const newContract = await response.json();
                    this.contracts.unshift(newContract);
                    this.currentTab = 'escrow';
                    alert('Procurement order initiated! Smart contract escrow created.');
                } else {
                    throw new Error('Contract creation failed');
                }
            } catch (error) {
                console.error('Error creating contract:', error);
                alert('Error processing procurement. Please try again.');
            }
        },

        async releaseEscrow(contract) {
            try {
                const response = await fetch(`${this.apiBase}/contracts/${contract.id}/release`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const updated = await response.json();
                    const index = this.contracts.findIndex(c => c.id === contract.id);
                    if (index !== -1) {
                        this.contracts[index] = updated;
                    }
                    alert('Escrow funds released securely to farmer account via smart contract!');
                } else {
                    throw new Error('Escrow release failed');
                }
            } catch (error) {
                console.error('Error releasing escrow:', error);
                alert('Error releasing escrow. Please try again.');
            }
        },

        async fetchContracts() {
            try {
                const response = await fetch(`${this.apiBase}/contracts`);
                if (response.ok) {
                    this.contracts = await response.json();
                } else {
                    console.error('Failed to fetch contracts');
                }
            } catch (error) {
                console.error('Error fetching contracts:', error);
            }
        }
    }
}
