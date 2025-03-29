# My Truck App - Architecture Documentation

## Overview

My Truck App follows a modular architecture designed to support scalability, maintainability, and performance. The application is built using React Native with Expo, following modern best practices for mobile development.

## High-Level Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Presentation    |     |  Business Logic  |     |  Data Access     |
|  Layer           |     |  Layer           |     |  Layer           |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  UI Components   |     |  Services        |     |  API Clients     |
|  Screens         |     |  Hooks           |     |  Storage         |
|  Navigation      |     |  State Mgmt      |     |  Caching         |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

## Core Components

### Presentation Layer

- **UI Components**: Reusable, atomic components that form the building blocks of the UI
- **Screens**: Compositions of UI components that represent full application screens
- **Navigation**: Handles routing and transitions between screens using Expo Router

### Business Logic Layer

- **Services**: Encapsulate business logic and orchestrate data operations
- **Hooks**: Custom React hooks for reusable logic and state management
- **State Management**: Manages application state using React Context and hooks

### Data Access Layer

- **API Clients**: Handle communication with external services (Telebirr, GeezSMS)
- **Storage**: Manages local data persistence using AsyncStorage
- **Caching**: Implements caching strategies for improved performance

## Key Design Patterns

### Component Composition

UI is built using a composition of smaller, reusable components. This promotes code reuse and maintainability.

Example:
```jsx
const BookingScreen = () => (
  <View>
    <Header title="Book a Truck" />
    <LocationSelector />
    <TruckTypeSelector />
    <PriceEstimate />
    <ActionButton text="Confirm Booking" />
  </View>
);
```

### Container/Presenter Pattern

Separates data fetching and state management (container) from presentation (presenter).

Example:
```jsx
// Container
const PaymentContainer = () => {
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = async () => {
    // Payment logic
  };
  
  return (
    <PaymentPresenter
      paymentMethod={paymentMethod}
      isProcessing={isProcessing}
      onPaymentMethodChange={setPaymentMethod}
      onSubmit={handlePayment}
    />
  );
};

// Presenter
const PaymentPresenter = ({ paymentMethod, isProcessing, onPaymentMethodChange, onSubmit }) => (
  <View>
    <PaymentOptions
      selectedMethod={paymentMethod}
      onSelectMethod={onPaymentMethodChange}
      isProcessing={isProcessing}
    />
    <Button onPress={onSubmit} disabled={isProcessing} text="Pay Now" />
  </View>
);
```

### Custom Hooks

Encapsulate and reuse stateful logic across components.

Example:
```jsx
const useOTPVerification = (initialValue = '', length = 6) => {
  const [value, setValue] = useState(initialValue);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  
  const verify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      // Verification logic
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return { value, setValue, isVerifying, error, verify };
};
```

## Navigation Architecture

The app uses Expo Router for file-based navigation, organizing screens in a hierarchical structure:

```
app/
├── _layout.tsx           # Root layout with theme provider
├── index.tsx             # Home/landing screen
├── auth/                 # Authentication screens
│   ├── phone-verification.tsx
│   └── profile-setup.tsx
├── customer/             # Customer-specific screens
│   ├── dashboard.tsx
│   ├── booking.tsx
│   ├── payment.tsx
│   └── tracking.tsx
├── driver/               # Driver-specific screens
│   ├── dashboard.tsx
│   └── job-details.tsx
└── settings/             # Settings screens
    └── index.tsx
```

## State Management

The application uses a combination of React Context and local component state:

- **Global State**: Managed through React Context for app-wide concerns (authentication, theme)
- **Screen State**: Managed within screen components using useState and useReducer
- **Form State**: Managed within form components with appropriate validation

Example of theme context:
```jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

## API Integration

API integrations are abstracted into service modules that handle the communication details:

```jsx
// telebirr.ts
export const initiateTelebirrPayment = async (params) => {
  try {
    // API call implementation
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
};

// Usage in component
const handlePayment = async () => {
  const result = await initiateTelebirrPayment({
    amount: price,
    referenceId: orderId
  });
  
  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
};
```

## Styling Approach

The app uses NativeWind (TailwindCSS for React Native) for styling, providing:

- Consistent design language
- Responsive layouts
- Dark mode support
- Performance optimizations

Example:
```jsx
<View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
  <Text className="text-lg font-bold text-gray-800 dark:text-white">
    Payment Method
  </Text>
  {/* Component content */}
</View>
```

## Performance Considerations

- **Memoization**: Using React.memo and useMemo to prevent unnecessary re-renders
- **Lazy Loading**: Implementing code splitting for screens and heavy components
- **Image Optimization**: Using optimized images and caching strategies
- **Virtualized Lists**: Using FlatList and SectionList for efficient rendering of long lists

## Security Measures

- **Secure Storage**: Using secure storage for sensitive information
- **API Security**: Implementing proper authentication and authorization
- **Input Validation**: Validating all user inputs to prevent injection attacks
- **Deep Linking Protection**: Validating deep links to prevent malicious redirects

## Testing Strategy

- **Unit Tests**: For individual functions and hooks
- **Component Tests**: For UI components using React Native Testing Library
- **Integration Tests**: For workflows and screen interactions
- **E2E Tests**: For critical user journeys using Detox

## Deployment Pipeline

- **CI/CD**: Using GitHub Actions for continuous integration and delivery
- **Code Quality**: Enforcing code quality with ESLint and TypeScript
- **Version Management**: Following semantic versioning for releases
- **App Store Deployment**: Automated submission to App Store and Google Play
