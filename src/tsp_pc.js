//bitmask create all possible routes
export function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;
  
    while (i < length) {
      if (c[i] < i) {
        k = i % 2 && c[i];
        p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }
    return result;
  }

export function calculateDistances(permutation, distances)
{
    let sum = distances[0][permutation[0]];
    for(let i = 1; i < permutation.length; i++)
        sum += distances[permutation[i-1]][permutation[i]];
    return sum;
}

export function isValid(permutation, requiredEdges)
{
    let vis = Array(permutation.length).fill(false);
    for(let i = 0; i < permutation.length; i++)
    {
        if(requiredEdges.hasOwnProperty(permutation[i]) && !vis[requiredEdges[permutation[i]]])
            return false;
        vis[permutation[i]] = true;
    }
    return true;
}

function createArrayFrom1ToN(n) {
    return Array.from({ length: n }, (_, index) => index + 1);
  }

//precondition: n >= 2
export function tsp_pc(n, distances, requiredEdges)
{
    let init_arr = createArrayFrom1ToN(n-1);
    let permutations = permute(init_arr);
    let min_val = 100000;
    let best_perm = init_arr;
    for(let i = 0; i < permutations.length; i++)
    {
        if(isValid(permutations[i],requiredEdges))
        {
            let dist = calculateDistances(permutations[i],distances);
            if(dist < min_val)
            {
                min_val = dist;
                best_perm = permutations[i];
            }
        }
    }
    return [best_perm,min_val];
}