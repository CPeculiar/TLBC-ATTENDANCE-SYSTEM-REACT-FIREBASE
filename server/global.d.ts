declare module 'express' {
    const express: any;
    export default express;
  }
  
  declare module 'cors' {
    const cors: any;
    export default cors;
  }
  
  declare module 'dotenv' {
    export const config: () => void;
  }