# ToDo

### Components
- [ ] BasicTable
  - [ ] Customizable title

  - [ ] Customizable grid row and column span:
    <div style="display:flex;flex-flow:row;background-color:white;width:fit-content;">
      <div style="width:50px;height:50px;background:linear-gradient(to bottom, blue 50%, white 0%);"></div>
      <div style="width:50px;height:50px;background:linear-gradient(to left, blue 50%, white 0%);"></div>
      <div style="width:50px;height:50px;background:linear-gradient(blue,blue);background-size:50% 50%;background-position:bottom right;background-repeat:no-repeat;"></div>
    </div>

  - [ ] `useEffect` and `useState` to allow lazy loading data

  - [ ] Data loaded as an array of records:
    ```js
    [
      { Key1: "value 1", Key2: "value 2" },
      { Key1: "value 3", Key2: "value 4" },
      { Key1: "value 5", Key3: "value 6" },
    ]
    ```

  - [ ] Automatic header generation:
    | Key1 | Key2 | Key3 |
    |------|------|------|
  
  - [ ] Automatic blank cells for missing data in a row:
    | Key1    | Key2    | Key3    |
    |---------|---------|---------|
    | value 1 | value 2 |         |
    | value 3 | value 4 |         |
    | value 5 |         | value 6 |