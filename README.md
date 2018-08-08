# Supported Question Types

## Multiple Choice Question

Example:

```yaml
type: multiple-choice-question
id: <uuid>
question: |
  What statements are true about the following dataset:

  ```
  student,height
  Ram,4.2
  Shyam,5.1
  George,5.0
  Rachel,4.8
  ```
options:
  - text: It has 2 observations and 4 variables.
  - text: It has 4 observations and 2 variables.
    correct: true
  - text: |
      `student` is an `identifier` variable and `height` is a `measured` variable.
    correct: true
  - text: |
      `student` uses `ordinal` scale.
```

## Categorization Question

Example:

```yaml
type: categorization-question
id: <uuid>
question: |
  Categorize the variables from the following dataset into their scale.

  | retailer   | date       | thumbsup | comments | title |
  |--- |--- |--- |--- |
  | Sam's Club | 2018-01-17 | 5      | 6        | 2 pk 32 oz. Vacuum Insulated Stainless Steel Water Bottle for $6.81 + Shipping $0.99 |
  | Groupon    | 2018-01-17 | 9      | 4        | NEW Sony XB30 Portable Wireless Speaker with Bluetooth, Black (2017 model) +FREE Shipping $79.99 |
  | Amazon     | 2018-01-17 | 15     | 15       | Community the Complete Series on DVD $60 lowest price ever on amazon.com |

categories: ['nominal', 'ordinal', 'interval', 'ratio', 'unstructured']
mappings:
  retailer: nominal
  date: nominal
  thumbsup: ratio
  comments: ratio
  title: unstructured
 ```
 
 ## Fill In The Blank Question
 
 Example:
 
 ```yaml
 type: fill-in-the-blank-question
question: |
  Look at the frequency distribution of `condition` variable and answer the following questions.
code: |
  # you can write code here.

blanks:
  - label: What's the number of unique conditions?
    answer: 5
  - label: Which condition has maximum frequency?
    answer: 3
  - label: How many houses have condition 5?
    answer: 1701
```

## Coding Question

Example:

```yaml
type: coding-question
question: |
  Reshape the array `a` to shape `(2, 4)`
code: |
  import numpy as np
  a = np.arange(8)
solution: |
  import numpy as np
  a = np.arange(8).reshape(2, 4)
tests:
  assert a.shape == (2, 4)
```

## Testless Coding Question

Example:

```yaml
type: testless-coding-question
id: <uuid>
question: |
  Ask the user to enter a number. If the number is greater than or equal to `0`, print `it's a +ve number`. Otherwise, print `it's a -ve number.`
code: |
  # your code goes here.
```

## Live Code

Example:

```yaml
type: live-code
id: <uuid>
code: |
  numbers = [1, -1, 0, -20, 31, -4, 6]

  pos_numbers = [num for num in numbers if num >= 0]

  print(pos_numbers)
```
